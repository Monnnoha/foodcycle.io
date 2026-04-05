package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.DonationFilterDTO;
import com.foodredistribution.foodredistribution.dto.FoodDonationDTO;
import com.foodredistribution.foodredistribution.entity.DonationStatus;
import com.foodredistribution.foodredistribution.entity.FoodDonation;
import com.foodredistribution.foodredistribution.entity.User;
import com.foodredistribution.foodredistribution.exception.BadRequestException;
import com.foodredistribution.foodredistribution.exception.ResourceNotFoundException;
import com.foodredistribution.foodredistribution.repository.DonationRepository;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodDonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    public FoodDonationDTO createDonation(FoodDonationDTO dto) {
        User donor = userRepository.findById(dto.getDonorId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found with id: " + dto.getDonorId()));

        FoodDonation donation = new FoodDonation();
        donation.setFoodDescription(dto.getFoodDescription());
        donation.setFoodType(dto.getFoodType());
        donation.setCity(dto.getCity());
        donation.setLocation(dto.getLocation());
        donation.setQuantity(dto.getQuantity());
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setDonor(donor);

        return toDTO(donationRepository.save(donation));
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

    public Page<FoodDonationDTO> search(DonationFilterDTO filter) {
        PageRequest pageable = PageRequest.of(filter.getPage(), filter.getSize());
        return donationRepository.search(
                filter.getKeyword(), filter.getFoodType(), filter.getCity(),
                filter.getStatus(), filter.getDonorId(), pageable)
                .map(this::toDTO);
    }

    /**
     * Advances a donation to the next status in the workflow:
     * AVAILABLE → REQUESTED → PICKED → DELIVERED
     */
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
        dto.setStatus(donation.getStatus());
        dto.setDonorId(donation.getDonor() != null ? donation.getDonor().getUserId() : null);
        dto.setCreatedAt(donation.getCreatedAt());
        dto.setUpdatedAt(donation.getUpdatedAt());
        return dto;
    }
}
