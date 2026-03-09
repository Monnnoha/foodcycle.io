package com.foodredistribution.foodredistribution.controller;

import com.foodredistribution.foodredistribution.entity.FoodDonation;
import com.foodredistribution.foodredistribution.repository.DonationRepository;
import com.foodredistribution.foodredistribution.service.FoodDonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    @Autowired
    private FoodDonationService donationService;

    @PostMapping
    public FoodDonation createDonation(@RequestBody FoodDonation donation) {
        return donationService.createDonation(donation);
    }
}
