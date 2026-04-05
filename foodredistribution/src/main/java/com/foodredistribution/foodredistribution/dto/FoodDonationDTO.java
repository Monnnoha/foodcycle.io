package com.foodredistribution.foodredistribution.dto;

import com.foodredistribution.foodredistribution.entity.DonationStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodDonationDTO {

    private Long donationId;

    @NotBlank(message = "Food description is required")
    private String foodDescription;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;

    private DonationStatus status;
    private Long donorId;
}
