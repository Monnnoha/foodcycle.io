package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.FoodDonationDTO;
import com.foodredistribution.foodredistribution.dto.PickupRequestDTO;
import com.foodredistribution.foodredistribution.entity.*;
import com.foodredistribution.foodredistribution.exception.BadRequestException;
import com.foodredistribution.foodredistribution.exception.ResourceNotFoundException;
import com.foodredistribution.foodredistribution.repository.DonationRepository;
import com.foodredistribution.foodredistribution.repository.PickupRepository;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PickupServiceTest {

    @Mock private PickupRepository pickupRepository;
    @Mock private DonationRepository donationRepository;
    @Mock private UserRepository userRepository;
    @Mock private FoodDonationService donationService;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private PickupService pickupService;

    private User donor;
    private User volunteer;
    private User ngo;
    private FoodDonation donation;
    private PickupRequestDTO pickupDTO;

    @BeforeEach
    void setUp() {
        donor = buildUser(1L, "donor@example.com", UserRole.DONOR);
        volunteer = buildUser(2L, "volunteer@example.com", UserRole.VOLUNTEER);
        ngo = buildUser(3L, "ngo@example.com", UserRole.NGO);

        donation = new FoodDonation();
        donation.setDonationId(10L);
        donation.setFoodDescription("Bread");
        donation.setQuantity(5);
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setDonor(donor);

        pickupDTO = new PickupRequestDTO(null, 10L, 2L, 3L, null, null, null);
    }

    // ── requestPickup ────────────────────────────────────────────────────────

    @Test
    void requestPickup_success_movesDonationToRequested() {
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));
        when(pickupRepository.existsByDonationDonationId(10L)).thenReturn(false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(volunteer));
        when(userRepository.findById(3L)).thenReturn(Optional.of(ngo));
        when(donationRepository.save(any())).thenReturn(donation);

        PickupRequest savedPickup = new PickupRequest();
        savedPickup.setPickupId(100L);
        savedPickup.setDonation(donation);
        savedPickup.setVolunteer(volunteer);
        savedPickup.setNgo(ngo);
        when(pickupRepository.save(any())).thenReturn(savedPickup);

        PickupRequestDTO result = pickupService.requestPickup(pickupDTO);

        assertThat(result.getPickupId()).isEqualTo(100L);
        assertThat(result.getDonationId()).isEqualTo(10L);
        verify(donationRepository).save(argThat(d -> d.getStatus() == DonationStatus.REQUESTED));
    }

    @Test
    void requestPickup_donationNotAvailable_throwsBadRequestException() {
        donation.setStatus(DonationStatus.REQUESTED);
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));

        assertThatThrownBy(() -> pickupService.requestPickup(pickupDTO))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available");

        verify(pickupRepository, never()).save(any());
    }

    @Test
    void requestPickup_duplicateRequest_throwsBadRequestException() {
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));
        when(pickupRepository.existsByDonationDonationId(10L)).thenReturn(true);

        assertThatThrownBy(() -> pickupService.requestPickup(pickupDTO))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already exists");

        verify(pickupRepository, never()).save(any());
    }

    @Test
    void requestPickup_volunteerNotFound_throwsResourceNotFoundException() {
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));
        when(pickupRepository.existsByDonationDonationId(10L)).thenReturn(false);
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pickupService.requestPickup(pickupDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Volunteer not found");
    }

    // ── markPicked ───────────────────────────────────────────────────────────

    @Test
    void markPicked_success_movesToPicked() {
        donation.setStatus(DonationStatus.REQUESTED);
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(donationService.toDTO(any())).thenAnswer(inv -> {
            FoodDonation d = inv.getArgument(0);
            FoodDonationDTO r = new FoodDonationDTO();
            r.setDonationId(d.getDonationId());
            r.setFoodDescription(d.getFoodDescription());
            r.setQuantity(d.getQuantity());
            r.setStatus(d.getStatus());
            r.setDonorId(1L);
            return r;
        });

        FoodDonationDTO result = pickupService.markPicked(10L);

        assertThat(result.getStatus()).isEqualTo(DonationStatus.PICKED);
    }

    @Test
    void markPicked_wrongStatus_throwsBadRequestException() {
        donation.setStatus(DonationStatus.AVAILABLE);
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));

        assertThatThrownBy(() -> pickupService.markPicked(10L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot mark donation as picked up");
    }

    // ── markDelivered ────────────────────────────────────────────────────────

    @Test
    void markDelivered_success_movesToDelivered() {
        donation.setStatus(DonationStatus.PICKED);
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(donationService.toDTO(any())).thenAnswer(inv -> {
            FoodDonation d = inv.getArgument(0);
            FoodDonationDTO r = new FoodDonationDTO();
            r.setDonationId(d.getDonationId());
            r.setFoodDescription(d.getFoodDescription());
            r.setQuantity(d.getQuantity());
            r.setStatus(d.getStatus());
            r.setDonorId(1L);
            return r;
        });

        FoodDonationDTO result = pickupService.markDelivered(10L);

        assertThat(result.getStatus()).isEqualTo(DonationStatus.DELIVERED);
    }

    @Test
    void markDelivered_wrongStatus_throwsBadRequestException() {
        donation.setStatus(DonationStatus.REQUESTED);
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));

        assertThatThrownBy(() -> pickupService.markDelivered(10L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot mark donation as delivered");
    }

    // ── cancelPickup ─────────────────────────────────────────────────────────

    @Test
    void cancelPickup_success_resetsDonationToAvailable() {
        donation.setStatus(DonationStatus.REQUESTED);
        PickupRequest pickup = new PickupRequest();
        pickup.setPickupId(100L);
        pickup.setDonation(donation);
        pickup.setVolunteer(volunteer);
        pickup.setNgo(ngo);

        when(pickupRepository.findById(100L)).thenReturn(Optional.of(pickup));
        when(donationRepository.save(any())).thenReturn(donation);

        pickupService.cancelPickup(100L);

        verify(donationRepository).save(argThat(d -> d.getStatus() == DonationStatus.AVAILABLE));
        verify(pickupRepository).delete(pickup);
    }

    @Test
    void cancelPickup_alreadyPicked_throwsBadRequestException() {
        donation.setStatus(DonationStatus.PICKED);
        PickupRequest pickup = new PickupRequest();
        pickup.setPickupId(100L);
        pickup.setDonation(donation);

        when(pickupRepository.findById(100L)).thenReturn(Optional.of(pickup));

        assertThatThrownBy(() -> pickupService.cancelPickup(100L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot cancel pickup");
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User buildUser(Long id, String email, UserRole role) {
        User u = new User();
        u.setUserId(id);
        u.setEmail(email);
        u.setRole(role);
        return u;
    }
}
