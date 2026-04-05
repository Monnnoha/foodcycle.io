package com.foodredistribution.foodredistribution.dto;

import com.foodredistribution.foodredistribution.entity.DonationStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class DonationFilterDTO {

    // Search / filter
    private String keyword;           // searches foodDescription
    private String foodType;
    private String city;
    private DonationStatus status;
    private Long donorId;

    // Date range — filters on createdAt
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateTo;

    // Sorting: field name — createdAt | quantity | expiryDate
    private String sortBy = "createdAt";

    // Direction: asc | desc
    private String sortDir = "desc";

    // Pagination
    private int page = 0;
    private int size = 10;
}
