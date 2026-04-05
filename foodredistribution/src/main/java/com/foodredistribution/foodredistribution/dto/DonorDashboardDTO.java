package com.foodredistribution.foodredistribution.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonorDashboardDTO {
    private long myDonations;          // total donations by this donor
    private long availableDonations;   // waiting to be picked up
    private long pendingPickups;       // REQUESTED + PICKED (in progress)
    private long completedDonations;   // DELIVERED
}
