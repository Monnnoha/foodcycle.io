package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.entity.FoodDonation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<FoodDonation, Long> {
}
