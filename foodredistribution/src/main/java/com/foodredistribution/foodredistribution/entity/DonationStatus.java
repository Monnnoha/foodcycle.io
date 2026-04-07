package com.foodredistribution.foodredistribution.entity;

public enum DonationStatus {
    AVAILABLE,
    REQUESTED,
    PICKED,
    DELIVERED,
    EXPIRED;

    public DonationStatus next() {
        return switch (this) {
            case AVAILABLE -> REQUESTED;
            case REQUESTED -> PICKED;
            case PICKED    -> DELIVERED;
            case DELIVERED -> throw new IllegalStateException("Donation already delivered");
            case EXPIRED   -> throw new IllegalStateException("Donation has expired");
        };
    }
}
