package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.aspect.Auditable;
import com.foodredistribution.foodredistribution.entity.AuditAction;
import com.foodredistribution.foodredistribution.dto.DonationFilterDTO;
import com.foodredistribution.foodredistribution.dto.FoodDonationDTO;
import com.foodredistribution.foodredistribution.entity.DonationStatus;
import com.foodredistribution.foodredistribution.entity.FoodDonation;
import com.foodredistribution.foodredistribution.entity.User;
import com.foodredistribution.foodredistribution.exception.BadRequestException;
import com.foodredistribution.foodredistribution.exception.ResourceNotFoundException;
import com.foodredistribution.foodredistribution.event.DonationCreatedEvent;
import com.foodredistribution.foodredistribution.repository.DonationRepository;
import com.foodredistribution.foodredistribution.repository.DonationSpecification;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import com.foodredistribution.foodredistribution.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class FoodDonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private StorageService storageService;

    @Auditable(action = AuditAction.DONATION_CREATED, entity = "FoodDonation")
    public FoodDonationDTO createDonation(FoodDonationDTO dto, org.springframework.web.multipart.MultipartFile image) {
        User donor = userRepository.findById(dto.getDonorId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found with id: " + dto.getDonorId()));

        FoodDonation donation = new FoodDonation();
        donation.setFoodDescription(dto.getFoodDescription());
        donation.setFoodType(dto.getFoodType());
        donation.setCity(dto.getCity());
        donation.setLocation(dto.getLocation());
        donation.setQuantity(dto.getQuantity());
        donation.setExpiryDate(dto.getExpiryDate());
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setDonor(donor);

        if (image != null && !image.isEmpty()) {
            donation.setImageUrl(storageService.store(image, "donations"));
        }

        FoodDonation saved = donationRepository.save(donation);
        eventPublisher.publishEvent(new DonationCreatedEvent(this, saved));
        return toDTO(saved);
    }

    // Keep backward-compatible overload for tests and internal calls
    public FoodDonationDTO createDonation(FoodDonationDTO dto) {
        return createDonation(dto, null);
    }

    public FoodDonationDTO getDonation(Long id) {
        return toDTO(findById(id));
    }

    public List<FoodDonationDTO> getAllDonations() {
        return donationRepository.findAll().stream().map(this::toDTO).toList();
    }

    public List<FoodDonationDTO> getDonationsByStatus(DonationStatus status) {
        return donationRepository.findByStatus(status).stream().map(this::toDTO).toList();
    }

    public List<FoodDonationDTO> getDonationsByDonor(Long donorId) {
        return donationRepository.findByDonorUserId(donorId).stream().map(this::toDTO).toList();
    }

    /** Used by @PreAuthorize SpEL — checks that the donor's email matches the authenticated user */
    public boolean isDonorOwner(Long donorId, String email) {
        return userRepository.findById(donorId)
                .map(u -> u.getEmail().equals(email))
                .orElse(false);
    }

    /**
     * Upload or replace the image for an existing donation.
     * Old image is deleted from storage before the new one is saved.
     */
    public FoodDonationDTO uploadImage(Long donationId, org.springframework.web.multipart.MultipartFile file) {
        FoodDonation donation = findById(donationId);
        if (donation.getImageUrl() != null) {
            storageService.delete(donation.getImageUrl());
        }
        String url = storageService.store(file, "donations");
        donation.setImageUrl(url);
        return toDTO(donationRepository.save(donation));
    }

    // Allowed sort fields — whitelist prevents injection via sortBy param
    private static final Set<String> SORTABLE_FIELDS = Set.of("createdAt", "quantity", "expiryDate");

    public Page<FoodDonationDTO> search(DonationFilterDTO filter) {
        String sortField = SORTABLE_FIELDS.contains(filter.getSortBy()) ? filter.getSortBy() : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDir())
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        PageRequest pageable = PageRequest.of(filter.getPage(), filter.getSize(),
                Sort.by(direction, sortField));

        return donationRepository.findAll(DonationSpecification.fromFilter(filter), pageable)
                .map(this::toDTO);
    }

    /**
     * Advances a donation to the next status in the workflow:
     * AVAILABLE → REQUESTED → PICKED → DELIVERED
     */
    @Auditable(action = AuditAction.DONATION_STATUS_ADVANCED, entity = "FoodDonation")
    public FoodDonationDTO advanceStatus(Long donationId) {
        FoodDonation donation = findById(donationId);
        try {
            donation.setStatus(donation.getStatus().next());
        } catch (IllegalStateException e) {
            throw new BadRequestException(e.getMessage());
        }
        return toDTO(donationRepository.save(donation));
    }

    private FoodDonation findById(Long id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
    }

    public FoodDonationDTO toDTO(FoodDonation donation) {
        FoodDonationDTO dto = new FoodDonationDTO();
        dto.setDonationId(donation.getDonationId());
        dto.setFoodDescription(donation.getFoodDescription());
        dto.setFoodType(donation.getFoodType());
        dto.setCity(donation.getCity());
        dto.setLocation(donation.getLocation());
        dto.setQuantity(donation.getQuantity());
        dto.setExpiryDate(donation.getExpiryDate());
        dto.setImageUrl(donation.getImageUrl());
        dto.setStatus(donation.getStatus());
        dto.setDonorId(donation.getDonor() != null ? donation.getDonor().getUserId() : null);
        dto.setCreatedAt(donation.getCreatedAt());
        dto.setUpdatedAt(donation.getUpdatedAt());
        return dto;
    }
}
