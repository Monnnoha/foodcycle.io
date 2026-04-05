package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.AdminDashboardDTO;
import com.foodredistribution.foodredistribution.dto.DonorDashboardDTO;
import com.foodredistribution.foodredistribution.dto.VolunteerDashboardDTO;
import com.foodredistribution.foodredistribution.entity.User;
import com.foodredistribution.foodredistribution.entity.UserRole;
import com.foodredistribution.foodredistribution.exception.BadRequestException;
import com.foodredistribution.foodredistribution.exception.ResourceNotFoundException;
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

    /**
     * Admin dashboard — single aggregation query for donations,
     * one count query for active pickups, one for total users.
     */
    public AdminDashboardDTO getAdminDashboard() {
        Object[] row = donationRepository.aggregateAllStatuses();

        long totalDonations      = toLong(row[0]);
        long availableDonations  = toLong(row[1]);
        long requested           = toLong(row[2]);
        long picked              = toLong(row[3]);
        long completedDeliveries = toLong(row[4]);
        long activePickups       = requested + picked;
        long totalUsers          = userRepository.count();

        return new AdminDashboardDTO(totalUsers, totalDonations, availableDonations, activePickups, completedDeliveries);
    }

    /**
     * Donor dashboard — single aggregation query scoped to this donor.
     */
    public DonorDashboardDTO getDonorDashboard(Long donorId) {
        validateRole(donorId, UserRole.DONOR);

        Object[] row = donationRepository.aggregateByDonor(donorId);

        long myDonations         = toLong(row[0]);
        long availableDonations  = toLong(row[1]);
        long requested           = toLong(row[2]);
        long picked              = toLong(row[3]);
        long completedDonations  = toLong(row[4]);
        long pendingPickups      = requested + picked;

        return new DonorDashboardDTO(myDonations, availableDonations, pendingPickups, completedDonations);
    }

    /**
     * Volunteer dashboard — single aggregation query scoped to this volunteer.
     */
    public VolunteerDashboardDTO getVolunteerDashboard(Long volunteerId) {
        validateRole(volunteerId, UserRole.VOLUNTEER);

        Object[] row = pickupRepository.aggregateByVolunteer(volunteerId);

        long totalAssigned    = toLong(row[0]);
        long activePickups    = toLong(row[1]);
        long completedPickups = toLong(row[2]);

        return new VolunteerDashboardDTO(totalAssigned, activePickups, completedPickups);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void validateRole(Long userId, UserRole expectedRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (user.getRole() != expectedRole) {
            throw new BadRequestException("User " + userId + " is not a " + expectedRole.name());
        }
    }

    private long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Long l) return l;
        if (value instanceof Number n) return n.longValue();
        return 0L;
    }
}
