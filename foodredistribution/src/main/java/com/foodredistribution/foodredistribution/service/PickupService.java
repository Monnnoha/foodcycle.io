package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.FoodDonationDTO;
import com.foodredistribution.foodredistribution.dto.PickupRequestDTO;
import com.foodredistribution.foodredistribution.dto.UpdatePickupRequest;
import com.foodredistribution.foodredistribution.entity.DonationStatus;
import com.foodredistribution.foodredistribution.entity.FoodDonation;
import com.foodredistribution.foodredistribution.entity.PickupRequest;
import com.foodredistribution.foodredistribution.entity.User;
import com.foodredistribution.foodredistribution.exception.BadRequestException;
import com.foodredistribution.foodredistribution.exception.ResourceNotFoundException;
import com.foodredistribution.foodredistribution.repository.DonationRepository;
import com.foodredistribution.foodredistribution.repository.PickupRepository;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PickupService {

    @Autowired
    private PickupRepository pickupRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodDonationService donationService;

    // ── CRUD ────────────────────────────────────────────────────────────────

    public Page<PickupRequestDTO> getAllPickups(int page, int size) {
        return pickupRepository.findAll(PageRequest.of(page, size)).map(this::toDTO);
    }

    public PickupRequestDTO getPickupById(Long id) {
        return toDTO(findById(id));
    }

    /**
     * Reassign volunteer and/or NGO on an existing pickup.
     * Only allowed while donation is still REQUESTED (not yet picked up).
     */
    @Transactional
    public PickupRequestDTO updatePickup(Long id, UpdatePickupRequest request) {
        PickupRequest pickup = findById(id);

        if (pickup.getDonation().getStatus() != DonationStatus.REQUESTED) {
            throw new BadRequestException(
                    "Cannot update pickup — donation is already " + pickup.getDonation().getStatus());
        }

        User volunteer = userRepository.findById(request.getVolunteerId())
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + request.getVolunteerId()));
        User ngo = userRepository.findById(request.getNgoId())
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found with id: " + request.getNgoId()));

        pickup.setVolunteer(volunteer);
        pickup.setNgo(ngo);
        return toDTO(pickupRepository.save(pickup));
    }

    /**
     * Cancel a pickup — resets donation back to AVAILABLE.
     * Only allowed while donation is still REQUESTED.
     */
    @Transactional
    public void cancelPickup(Long id) {
        PickupRequest pickup = findById(id);

        if (pickup.getDonation().getStatus() != DonationStatus.REQUESTED) {
            throw new BadRequestException(
                    "Cannot cancel pickup — donation is already " + pickup.getDonation().getStatus());
        }

        FoodDonation donation = pickup.getDonation();
        donation.setStatus(DonationStatus.AVAILABLE);
        donationRepository.save(donation);
        pickupRepository.delete(pickup);
    }

    // ── Workflow ─────────────────────────────────────────────────────────────

    /** Volunteer requests a pickup: AVAILABLE → REQUESTED */
    @Transactional
    public PickupRequestDTO requestPickup(PickupRequestDTO dto) {
        FoodDonation donation = donationRepository.findById(dto.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + dto.getDonationId()));

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new BadRequestException("Donation is not available. Current status: " + donation.getStatus());
        }
        if (pickupRepository.existsByDonationDonationId(dto.getDonationId())) {
            throw new BadRequestException("A pickup request already exists for donation: " + dto.getDonationId());
        }

        User volunteer = userRepository.findById(dto.getVolunteerId())
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + dto.getVolunteerId()));
        User ngo = userRepository.findById(dto.getNgoId())
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found with id: " + dto.getNgoId()));

        donation.setStatus(DonationStatus.REQUESTED);
        donationRepository.save(donation);

        PickupRequest pickup = new PickupRequest();
        pickup.setDonation(donation);
        pickup.setVolunteer(volunteer);
        pickup.setNgo(ngo);

        return toDTO(pickupRepository.save(pickup));
    }

    /** REQUESTED → PICKED */
    @Transactional
    public FoodDonationDTO markPicked(Long donationId) {
        return advanceAndValidate(donationId, DonationStatus.REQUESTED, "picked up");
    }

    /** PICKED → DELIVERED */
    @Transactional
    public FoodDonationDTO markDelivered(Long donationId) {
        return advanceAndValidate(donationId, DonationStatus.PICKED, "delivered");
    }

    public PickupRequestDTO getPickupByDonation(Long donationId) {
        return pickupRepository.findByDonationDonationId(donationId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("No pickup request found for donation: " + donationId));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private FoodDonationDTO advanceAndValidate(Long donationId, DonationStatus required, String action) {
        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + donationId));

        if (donation.getStatus() != required) {
            throw new BadRequestException(
                    "Cannot mark donation as " + action + ". Current status: " + donation.getStatus());
        }

        donation.setStatus(donation.getStatus().next());
        return donationService.toDTO(donationRepository.save(donation));
    }

    private PickupRequest findById(Long id) {
        return pickupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup request not found with id: " + id));
    }

    public PickupRequestDTO toDTO(PickupRequest p) {
        return new PickupRequestDTO(
                p.getPickupId(),
                p.getDonation().getDonationId(),
                p.getVolunteer().getUserId(),
                p.getNgo().getUserId(),
                p.getDonation().getDonor() != null ? p.getDonation().getDonor().getUserId() : null,
                p.getDonation().getFoodDescription(),
                p.getDonation().getStatus().name()
        );
    }
}
