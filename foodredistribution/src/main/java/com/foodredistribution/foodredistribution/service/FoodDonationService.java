package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.entity.FoodDonation;
import com.foodredistribution.foodredistribution.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FoodDonationService {

    @Autowired
    private DonationRepository donationRepository;

    public FoodDonation createDonation(FoodDonation donation) {
        donation.setStatus("AVAILABLE");
        return donationRepository.save(donation);
    }
}
