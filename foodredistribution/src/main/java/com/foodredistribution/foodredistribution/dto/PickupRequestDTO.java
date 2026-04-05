package com.foodredistribution.foodredistribution.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupRequestDTO {

    private Long pickupId;

    @NotNull(message = "Donation ID is required")
    private Long donationId;

    @NotNull(message = "Volunteer ID is required")
    private Long volunteerId;

    @NotNull(message = "NGO ID is required")
    private Long ngoId;

    private Long donorId;
    private String donationDescription;
    private String donationStatus;
}
