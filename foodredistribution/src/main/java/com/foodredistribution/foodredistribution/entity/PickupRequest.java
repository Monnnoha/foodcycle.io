package com.foodredistribution.foodredistribution.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "pickup_requests",
    uniqueConstraints = @UniqueConstraint(name = "uk_pickup_donation", columnNames = "donation_id")
)
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class PickupRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pickupId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_pickup_donation"))
    private FoodDonation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_pickup_volunteer"))
    private User volunteer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_pickup_ngo"))
    private User ngo;
}
