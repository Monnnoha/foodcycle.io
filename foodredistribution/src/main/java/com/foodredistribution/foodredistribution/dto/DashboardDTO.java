package com.foodredistribution.foodredistribution.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalDonations;
    private long availableDonations;
    private long activePickups;       // REQUESTED + PICKED
    private long completedDeliveries; // DELIVERED
    private long totalUsers;
}
