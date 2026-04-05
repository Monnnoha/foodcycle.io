package com.foodredistribution.foodredistribution.event;

import com.foodredistribution.foodredistribution.entity.NotificationType;
import com.foodredistribution.foodredistribution.entity.PickupRequest;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class DonationEvent extends ApplicationEvent {

    private final PickupRequest pickupRequest;
    private final NotificationType type;

    public DonationEvent(Object source, PickupRequest pickupRequest, NotificationType type) {
        super(source);
        this.pickupRequest = pickupRequest;
        this.type = type;
    }
}
