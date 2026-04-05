package com.foodredistribution.foodredistribution.event;

import com.foodredistribution.foodredistribution.entity.FoodDonation;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class DonationCreatedEvent extends ApplicationEvent {

    private final FoodDonation donation;

    public DonationCreatedEvent(Object source, FoodDonation donation) {
        super(source);
        this.donation = donation;
    }
}
