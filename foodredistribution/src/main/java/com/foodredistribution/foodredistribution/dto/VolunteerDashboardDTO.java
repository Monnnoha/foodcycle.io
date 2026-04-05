package com.foodredistribution.foodredistribution.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerDashboardDTO {
    private long totalAssigned;        // all pickups ever assigned to this volunteer
    private long activePickups;        // currently REQUESTED or PICKED
    private long completedPickups;     // DELIVERED
}
