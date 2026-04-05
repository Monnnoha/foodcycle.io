package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.NotificationDTO;
import com.foodredistribution.foodredistribution.entity.*;
import com.foodredistribution.foodredistribution.event.DonationEvent;
import com.foodredistribution.foodredistribution.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Listens for DonationEvents published by PickupService and creates
     * notifications for the relevant parties asynchronously.
     */
    @Async
    @EventListener
    public void handleDonationEvent(DonationEvent event) {
        PickupRequest pickup = event.getPickupRequest();
        FoodDonation donation = pickup.getDonation();
        NotificationType type = event.getType();

        switch (type) {
            case PICKUP_REQUESTED -> {
                // Notify donor that someone requested their donation
                save(pickup.getDonation().getDonor(),
                        "Pickup Requested",
                        "Your donation '" + donation.getFoodDescription() + "' has been requested for pickup.",
                        type, donation.getDonationId());
                // Notify NGO they've been assigned
                save(pickup.getNgo(),
                        "New Pickup Assignment",
                        "A pickup has been assigned to your NGO for donation: " + donation.getFoodDescription(),
                        type, donation.getDonationId());
            }
            case DONATION_PICKED -> {
                save(pickup.getDonation().getDonor(),
                        "Donation Picked Up",
                        "Your donation '" + donation.getFoodDescription() + "' has been picked up by a volunteer.",
                        type, donation.getDonationId());
                save(pickup.getNgo(),
                        "Donation En Route",
                        "Donation '" + donation.getFoodDescription() + "' is on its way to your NGO.",
                        type, donation.getDonationId());
            }
            case DONATION_DELIVERED -> {
                save(pickup.getDonation().getDonor(),
                        "Donation Delivered",
                        "Your donation '" + donation.getFoodDescription() + "' has been successfully delivered.",
                        type, donation.getDonationId());
                save(pickup.getVolunteer(),
                        "Delivery Complete",
                        "Thank you for delivering '" + donation.getFoodDescription() + "'.",
                        type, donation.getDonationId());
            }
            case PICKUP_CANCELLED -> {
                save(pickup.getDonation().getDonor(),
                        "Pickup Cancelled",
                        "The pickup for your donation '" + donation.getFoodDescription() + "' was cancelled.",
                        type, donation.getDonationId());
            }
        }
    }

    public Page<NotificationDTO> getNotificationsForUser(Long userId, int page, int size) {
        return notificationRepository
                .findByRecipientUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    private void save(User recipient, String title, String message, NotificationType type, Long donationId) {
        notificationRepository.save(new Notification(recipient, title, message, type, donationId));
    }

    private NotificationDTO toDTO(Notification n) {
        return new NotificationDTO(
                n.getNotificationId(),
                n.getTitle(),
                n.getMessage(),
                n.isRead(),
                n.getType(),
                n.getDonationId(),
                n.getCreatedAt()
        );
    }
}
