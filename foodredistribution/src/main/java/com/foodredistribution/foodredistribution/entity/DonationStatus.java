package com.foodredistribution.foodredistribution.entity;

public enum DonationStatus {
    AVAILABLE,
    REQUESTED,
    PICKED,
    DELIVERED;

    public DonationStatus next() {
        return switch (this) {
            case AVAILABLE -> REQUESTED;
            case REQUESTED -> PICKED;
            case PICKED    -> DELIVERED;
            case DELIVERED -> throw new IllegalStateException("Donation already delivered");
        };
    }
}
