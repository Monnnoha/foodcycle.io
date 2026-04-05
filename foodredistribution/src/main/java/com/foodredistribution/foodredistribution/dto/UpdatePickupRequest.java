package com.foodredistribution.foodredistribution.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePickupRequest {

    @NotNull(message = "Volunteer ID is required")
    private Long volunteerId;

    @NotNull(message = "NGO ID is required")
    private Long ngoId;
}
