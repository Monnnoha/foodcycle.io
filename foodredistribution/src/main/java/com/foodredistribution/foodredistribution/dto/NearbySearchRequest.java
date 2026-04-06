package com.foodredistribution.foodredistribution.dto;

import com.foodredistribution.foodredistribution.entity.DonationStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NearbySearchRequest {

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0",  message = "Latitude must be >= -90")
    @DecimalMax(value = "90.0",   message = "Latitude must be <= 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
    @DecimalMax(value = "180.0",  message = "Longitude must be <= 180")
    private Double longitude;

    /** Search radius in kilometres. Default 10, max 100. */
    @Min(value = 1,   message = "Radius must be at least 1 km")
    @Max(value = 100, message = "Radius must not exceed 100 km")
    private double radiusKm = 10.0;

    /** Optional status filter — defaults to AVAILABLE */
    private DonationStatus status = DonationStatus.AVAILABLE;

    private int page = 0;
    private int size = 20;
}
