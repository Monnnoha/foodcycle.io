package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.FoodDonationDTO;
import com.foodredistribution.foodredistribution.entity.DonationStatus;
import com.foodredistribution.foodredistribution.entity.FoodDonation;
import com.foodredistribution.foodredistribution.entity.User;
import com.foodredistribution.foodredistribution.entity.UserRole;
import com.foodredistribution.foodredistribution.exception.BadRequestException;
import com.foodredistribution.foodredistribution.exception.ResourceNotFoundException;
import com.foodredistribution.foodredistribution.repository.DonationRepository;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoodDonationServiceTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FoodDonationService donationService;

    private User donor;
    private FoodDonation donation;

    @BeforeEach
    void setUp() {
        donor = new User();
        donor.setUserId(1L);
        donor.setName("Donor");
        donor.setEmail("donor@example.com");
        donor.setRole(UserRole.DONOR);

        donation = new FoodDonation();
        donation.setDonationId(1L);
        donation.setFoodDescription("Rice bags");
        donation.setQuantity(10);
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setDonor(donor);
    }

    @Test
    void createDonation_success_setsStatusAvailable() {
        FoodDonationDTO dto = new FoodDonationDTO(null, "Rice bags", 10, null, 1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(donor));
        when(donationRepository.save(any(FoodDonation.class))).thenReturn(donation);

        FoodDonationDTO result = donationService.createDonation(dto);

        assertThat(result.getStatus()).isEqualTo(DonationStatus.AVAILABLE);
        assertThat(result.getFoodDescription()).isEqualTo("Rice bags");
        assertThat(result.getDonorId()).isEqualTo(1L);

        verify(donationRepository).save(argThat(d -> d.getStatus() == DonationStatus.AVAILABLE));
    }

    @Test
    void createDonation_donorNotFound_throwsResourceNotFoundException() {
        FoodDonationDTO dto = new FoodDonationDTO(null, "Rice bags", 10, null, 99L);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> donationService.createDonation(dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Donor not found");

        verify(donationRepository, never()).save(any());
    }

    @Test
    void advanceStatus_availableToRequested() {
        donation.setStatus(DonationStatus.AVAILABLE);
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FoodDonationDTO result = donationService.advanceStatus(1L);

        assertThat(result.getStatus()).isEqualTo(DonationStatus.REQUESTED);
    }

    @Test
    void advanceStatus_requestedToPicked() {
        donation.setStatus(DonationStatus.REQUESTED);
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FoodDonationDTO result = donationService.advanceStatus(1L);

        assertThat(result.getStatus()).isEqualTo(DonationStatus.PICKED);
    }

    @Test
    void advanceStatus_pickedToDelivered() {
        donation.setStatus(DonationStatus.PICKED);
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FoodDonationDTO result = donationService.advanceStatus(1L);

        assertThat(result.getStatus()).isEqualTo(DonationStatus.DELIVERED);
    }

    @Test
    void advanceStatus_alreadyDelivered_throwsBadRequestException() {
        donation.setStatus(DonationStatus.DELIVERED);
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));

        assertThatThrownBy(() -> donationService.advanceStatus(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already delivered");
    }

    @Test
    void getDonation_notFound_throwsResourceNotFoundException() {
        when(donationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> donationService.getDonation(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Donation not found");
    }
}
