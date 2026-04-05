package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.entity.DonationStatus;
import com.foodredistribution.foodredistribution.entity.PickupRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PickupRepository extends JpaRepository<PickupRequest, Long> {

    Optional<PickupRequest> findByDonationDonationId(Long donationId);

    boolean existsByDonationDonationId(Long donationId);

    Page<PickupRequest> findByVolunteerUserId(Long volunteerId, Pageable pageable);

    Page<PickupRequest> findByNgoUserId(Long ngoId, Pageable pageable);

    long countByVolunteerUserId(Long volunteerId);

    // Single query — volunteer dashboard: assigned (REQUESTED+PICKED) vs completed (DELIVERED)
    @Query("SELECT " +
           "COUNT(p), " +
           "SUM(CASE WHEN p.donation.status IN ('REQUESTED', 'PICKED') THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.donation.status = 'DELIVERED'              THEN 1 ELSE 0 END) " +
           "FROM PickupRequest p WHERE p.volunteer.userId = :volunteerId")
    Object[] aggregateByVolunteer(@Param("volunteerId") Long volunteerId);

    // Total active pickups across the platform (REQUESTED + PICKED)
    @Query("SELECT COUNT(p) FROM PickupRequest p " +
           "WHERE p.donation.status IN ('REQUESTED', 'PICKED')")
    long countActivePickups();
}
