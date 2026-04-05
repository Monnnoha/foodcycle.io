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

    // Single query — returns [total, available, requested, picked, delivered]
    // Used by admin dashboard to avoid 5 round-trips
    @Query("SELECT " +
           "COUNT(d), " +
           "SUM(CASE WHEN d.status = 'AVAILABLE'  THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'REQUESTED'  THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'PICKED'     THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'DELIVERED'  THEN 1 ELSE 0 END) " +
           "FROM FoodDonation d")
    Object[] aggregateAllStatuses();

    // Single query for donor dashboard — counts per status for one donor
    @Query("SELECT " +
           "COUNT(d), " +
           "SUM(CASE WHEN d.status = 'AVAILABLE'  THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'REQUESTED'  THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'PICKED'     THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'DELIVERED'  THEN 1 ELSE 0 END) " +
           "FROM FoodDonation d WHERE d.donor.userId = :donorId")
    Object[] aggregateByDonor(@Param("donorId") Long donorId);
}
           "(:keyword  IS NULL OR LOWER(d.foodDescription) LIKE LOWER(CONCAT('%', :keyword,  '%'))) AND " +
           "(:foodType IS NULL OR LOWER(d.foodType)        LIKE LOWER(CONCAT('%', :foodType, '%'))) AND " +
           "(:city     IS NULL OR LOWER(d.city)            LIKE LOWER(CONCAT('%', :city,     '%'))) AND " +
           "(:status   IS NULL OR d.status = :status) AND " +
           "(:donorId  IS NULL OR d.donor.userId = :donorId)")
    Page<FoodDonation> search(
            @Param("keyword")  String keyword,
            @Param("foodType") String foodType,
            @Param("city")     String city,
            @Param("status")   DonationStatus status,
            @Param("donorId")  Long donorId,
            Pageable pageable
    );
