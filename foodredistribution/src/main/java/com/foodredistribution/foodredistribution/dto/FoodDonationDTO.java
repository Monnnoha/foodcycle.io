package com.foodredistribution.foodredistribution.dto;

import com.foodredistribution.foodredistribution.entity.DonationStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodDonationDTO {

    private Long donationId;

    @NotBlank(message = "Food description is required")
    private String foodDescription;

    private String foodType;

    private String city;

    private String location;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;

    private LocalDate expiryDate;

    private String imageUrl;

    private DonationStatus status;

    @NotNull(message = "Donor ID is required")
    private Long donorId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
