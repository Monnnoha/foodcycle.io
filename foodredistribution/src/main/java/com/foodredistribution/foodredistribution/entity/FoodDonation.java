package com.foodredistribution.foodredistribution.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "food_donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodDonation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long donationId;

    private String foodDescription;
    private int quantity;
    private String status;
}
