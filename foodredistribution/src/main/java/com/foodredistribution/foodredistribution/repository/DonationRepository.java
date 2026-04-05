package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.entity.DonationStatus;
import com.foodredistribution.foodredistribution.entity.FoodDonation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DonationRepository extends JpaRepository<FoodDonation, Long> {

    List<FoodDonation> findByStatus(DonationStatus status);

    List<FoodDonation> findByDonorUserId(Long donorId);

    @Query("SELECT d FROM FoodDonation d WHERE " +
           "(:keyword IS NULL OR LOWER(d.foodDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:donorId IS NULL OR d.donor.userId = :donorId)")
    Page<FoodDonation> search(
            @Param("keyword") String keyword,
            @Param("status") DonationStatus status,
            @Param("donorId") Long donorId,
            Pageable pageable
    );
}
