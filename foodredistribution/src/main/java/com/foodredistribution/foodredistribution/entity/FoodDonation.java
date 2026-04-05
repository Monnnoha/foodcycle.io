package com.foodredistribution.foodredistribution.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "food_donations")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class FoodDonation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long donationId;

    @Column(nullable = false, length = 500)
    private String foodDescription;

    @Column(nullable = false)
    private int quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DonationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_donation_donor"))
    private User donor;

    // Optimistic locking — prevents two concurrent requests both reading AVAILABLE
    // and both creating a pickup. Second writer gets ObjectOptimisticLockingFailureException.
    @Version
    private Long version;
}
