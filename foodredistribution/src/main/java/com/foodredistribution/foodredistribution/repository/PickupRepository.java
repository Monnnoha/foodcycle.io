package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.entity.PickupRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PickupRepository extends JpaRepository<PickupRequest, Long> {
    Optional<PickupRequest> findByDonationDonationId(Long donationId);
    boolean existsByDonationDonationId(Long donationId);
    Page<PickupRequest> findByVolunteerUserId(Long volunteerId, Pageable pageable);
    Page<PickupRequest> findByNgoUserId(Long ngoId, Pageable pageable);
}
