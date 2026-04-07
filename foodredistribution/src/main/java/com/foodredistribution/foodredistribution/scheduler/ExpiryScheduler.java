package com.foodredistribution.foodredistribution.scheduler;

import com.foodredistribution.foodredistribution.repository.DonationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Scheduled job that auto-marks expired donations.
 * Runs daily at midnight. Donations whose expiryDate has passed
 * and are still AVAILABLE or REQUESTED are bulk-updated to EXPIRED.
 */
@Component
public class ExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(ExpiryScheduler.class);

    @Autowired
    private DonationRepository donationRepository;

    /**
     * Runs every day at 00:00 server time.
     * Cron: second minute hour day month weekday
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markExpiredDonations() {
        LocalDate today = LocalDate.now();
        int count = donationRepository.bulkExpire(today);
        if (count > 0) {
            log.info("Expiry job: marked {} donation(s) as EXPIRED (cutoff date: {})", count, today);
        }
    }
}
