package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.entity.DonationStatus;
import com.foodredistribution.foodredistribution.entity.FoodDonation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DonationRepository extends JpaRepository<FoodDonation, Long>,
        JpaSpecificationExecutor<FoodDonation> {

    List<FoodDonation> findByStatus(DonationStatus status);

    List<FoodDonation> findByDonorUserId(Long donorId);

    long countByStatus(DonationStatus status);

    long countByDonorUserId(Long donorId);

    long countByDonorUserIdAndStatus(Long donorId, DonationStatus status);

    // Single aggregation — admin dashboard (avoids 5 round-trips)
    @Query("SELECT COUNT(d), " +
           "SUM(CASE WHEN d.status = 'AVAILABLE' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'REQUESTED' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'PICKED'    THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) " +
           "FROM FoodDonation d")
    Object[] aggregateAllStatuses();

    // Single aggregation scoped to one donor — donor dashboard
    @Query("SELECT COUNT(d), " +
           "SUM(CASE WHEN d.status = 'AVAILABLE' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'REQUESTED' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'PICKED'    THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) " +
           "FROM FoodDonation d WHERE d.donor.userId = :donorId")
    Object[] aggregateByDonor(@Param("donorId") Long donorId);

    /**
     * Haversine nearby search using native SQL.
     *
     * Returns donations within :radiusKm kilometres of (:lat, :lon).
     * The Haversine formula is computed in SQL so only matching rows are
     * returned — no full table scan + in-memory filter.
     *
     * Formula:
     *   distance = 2 * R * ASIN(SQRT(
     *     POWER(SIN(RADIANS(d.latitude  - :lat) / 2), 2) +
     *     COS(RADIANS(:lat)) * COS(RADIANS(d.latitude)) *
     *     POWER(SIN(RADIANS(d.longitude - :lon) / 2), 2)
     *   ))
     * where R = 6371 km (Earth radius).
     *
     * Columns returned: all FoodDonation columns + distance_km alias.
     * Spring Data maps the entity columns automatically; distanceKm is
     * extracted separately in the service layer.
     */
    @Query(value =
        "SELECT d.*, " +
        "  (6371 * 2 * ASIN(SQRT(" +
        "    POWER(SIN(RADIANS(d.latitude  - :lat) / 2), 2) + " +
        "    COS(RADIANS(:lat)) * COS(RADIANS(d.latitude)) * " +
        "    POWER(SIN(RADIANS(d.longitude - :lon) / 2), 2)" +
        "  ))) AS distance_km " +
        "FROM food_donations d " +
        "WHERE d.latitude  IS NOT NULL " +
        "  AND d.longitude IS NOT NULL " +
        "  AND d.status = :status " +
        "  AND (6371 * 2 * ASIN(SQRT(" +
        "    POWER(SIN(RADIANS(d.latitude  - :lat) / 2), 2) + " +
        "    COS(RADIANS(:lat)) * COS(RADIANS(d.latitude)) * " +
        "    POWER(SIN(RADIANS(d.longitude - :lon) / 2), 2)" +
        "  ))) <= :radiusKm " +
        "ORDER BY distance_km ASC",
        countQuery =
        "SELECT COUNT(*) FROM food_donations d " +
        "WHERE d.latitude IS NOT NULL AND d.longitude IS NOT NULL " +
        "  AND d.status = :status " +
        "  AND (6371 * 2 * ASIN(SQRT(" +
        "    POWER(SIN(RADIANS(d.latitude  - :lat) / 2), 2) + " +
        "    COS(RADIANS(:lat)) * COS(RADIANS(d.latitude)) * " +
        "    POWER(SIN(RADIANS(d.longitude - :lon) / 2), 2)" +
        "  ))) <= :radiusKm",
        nativeQuery = true)
    Page<FoodDonation> findNearby(
            @Param("lat")      double lat,
            @Param("lon")      double lon,
            @Param("radiusKm") double radiusKm,
            @Param("status")   String status,
            Pageable pageable);
}
