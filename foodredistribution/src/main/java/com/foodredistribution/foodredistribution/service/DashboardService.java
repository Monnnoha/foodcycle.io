package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.DashboardDTO;
import com.foodredistribution.foodredistribution.entity.DonationStatus;
import com.foodredistribution.foodredistribution.repository.DonationRepository;
import com.foodredistribution.foodredistribution.repository.PickupRepository;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private PickupRepository pickupRepository;

    @Autowired
    private UserRepository userRepository;

    public DashboardDTO getStats() {
        long total       = donationRepository.count();
        long available   = donationRepository.countByStatus(DonationStatus.AVAILABLE);
        long requested   = donationRepository.countByStatus(DonationStatus.REQUESTED);
        long picked      = donationRepository.countByStatus(DonationStatus.PICKED);
        long delivered   = donationRepository.countByStatus(DonationStatus.DELIVERED);
        long totalUsers  = userRepository.count();

        return new DashboardDTO(total, available, requested + picked, delivered, totalUsers);
    }
}
