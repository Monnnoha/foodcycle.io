package com.foodredistribution.foodredistribution.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pickup_requests")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PickupRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pickupId;

    private Long donationId;
    private Long volunteerId;
    private Long ngoId;
}
