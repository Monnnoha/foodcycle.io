package com.foodredistribution.foodredistribution.dto;

import com.foodredistribution.foodredistribution.entity.DonationStatus;
import lombok.Data;

@Data
public class DonationFilterDTO {
    private String keyword;       // searches foodDescription
    private DonationStatus status;
    private Long donorId;
    private int page = 0;
    private int size = 10;
}
