package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.NotificationDTO;
import com.foodredistribution.foodredistribution.entity.*;
import com.foodredistribution.foodredistribution.event.DonationCreatedEvent;
import com.foodredistribution.foodredistribution.event.DonationEvent;
import com.foodredistribution.foodredistribution.exception.ResourceNotFoundException;
import com.foodredistribution.foodredistribution.repository.NotificationRepository;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // ── Event listeners ───────────────────────────────────────────────────────

    /**
     * Fires when a DONOR creates a new donation.
     * Notifies: the donor (confirmation) + ALL registered NGOs (new food available).
     */
    @Async
    @EventListener
    public void handleDonationCreated(DonationCreatedEvent event) {
        FoodDonation donation = event.getDonation();

        // 1. Confirm to donor
        save(donation.getDonor(),
                "Donation Created ✓",
                "Your donation '" + donation.getFoodDescription() + "' is live. NGOs will review it shortly.",
                NotificationType.DONATION_CREATED,
                donation.getDonationId());

        // 2. Notify ALL NGOs so they can review and accept
        List<User> ngos = userRepository.findByRole(UserRole.NGO);
        for (User ngo : ngos) {
            save(ngo,
                    "New Donation Available",
                    "A new donation '" + donation.getFoodDescription() + "' ("
                            + donation.getQuantity() + " units"
                            + (donation.getCity() != null ? ", " + donation.getCity() : "")
                            + ") is waiting for your review.",
                    NotificationType.DONATION_CREATED,
                    donation.getDonationId());
        }
    }

    /** Fires on pickup workflow transitions — notifies relevant parties */
    @Async
    @EventListener
    public void handleDonationEvent(DonationEvent event) {
        PickupRequest pickup = event.getPickupRequest();
        FoodDonation donation = pickup.getDonation();
        NotificationType type = event.getType();

        switch (type) {
            case PICKUP_REQUESTED -> {
                // Donor knows their donation was claimed
                save(donation.getDonor(),
                        "Pickup Requested",
                        "Your donation '" + donation.getFoodDescription() + "' has been requested for pickup.",
                        type, donation.getDonationId());
                // Volunteer confirmation
                save(pickup.getVolunteer(),
                        "Pickup Confirmed",
                        "You have successfully requested pickup for '" + donation.getFoodDescription() + "'.",
                        type, donation.getDonationId());
            }
            case NGO_ACCEPTED -> {
                // Notify ALL volunteers that a donation is ready for pickup
                List<User> volunteers = userRepository.findByRole(UserRole.VOLUNTEER);
                for (User volunteer : volunteers) {
                    save(volunteer,
                            "Donation Ready for Pickup 🚚",
                            "NGO has approved '" + donation.getFoodDescription() + "' ("
                                    + donation.getQuantity() + " units"
                                    + (donation.getCity() != null ? " in " + donation.getCity() : "")
                                    + "). You can now request pickup.",
                            type, donation.getDonationId());
                }
                // Confirm to the NGO that accepted
                save(pickup.getNgo(),
                        "Donation Accepted",
                        "You accepted '" + donation.getFoodDescription() + "'. Volunteers have been notified.",
                        type, donation.getDonationId());
                // Notify donor
                save(donation.getDonor(),
                        "NGO Accepted Your Donation",
                        "An NGO has accepted your donation '" + donation.getFoodDescription() + "'. A volunteer will pick it up soon.",
                        type, donation.getDonationId());
            }
            case PICKUP_ASSIGNED -> {
                // NGO notified of assignment
                save(pickup.getNgo(),
                        "Pickup Assigned to Your NGO",
                        "Donation '" + donation.getFoodDescription() + "' has been assigned to your NGO.",
                        type, donation.getDonationId());
                // Volunteer notified of NGO assignment
                save(pickup.getVolunteer(),
                        "NGO Assigned",
                        "Your pickup for '" + donation.getFoodDescription() + "' is assigned to an NGO.",
                        type, donation.getDonationId());
            }
            case DONATION_PICKED -> {
                save(donation.getDonor(),
                        "Donation Picked Up",
                        "Your donation '" + donation.getFoodDescription() + "' has been picked up.",
                        type, donation.getDonationId());
                save(pickup.getNgo(),
                        "Donation En Route",
                        "Donation '" + donation.getFoodDescription() + "' is on its way to your NGO.",
                        type, donation.getDonationId());
            }
            case DONATION_DELIVERED -> {
                save(donation.getDonor(),
                        "Donation Delivered",
                        "Your donation '" + donation.getFoodDescription() + "' was successfully delivered.",
                        type, donation.getDonationId());
                save(pickup.getVolunteer(),
                        "Delivery Complete",
                        "Thank you for delivering '" + donation.getFoodDescription() + "'.",
                        type, donation.getDonationId());
                save(pickup.getNgo(),
                        "Donation Received",
                        "Donation '" + donation.getFoodDescription() + "' has been delivered to your NGO.",
                        type, donation.getDonationId());
            }
            case PICKUP_CANCELLED -> {
                save(donation.getDonor(),
                        "Pickup Cancelled",
                        "The pickup for your donation '" + donation.getFoodDescription() + "' was cancelled. It is available again.",
                        type, donation.getDonationId());
                save(pickup.getVolunteer(),
                        "Pickup Cancelled",
                        "Your pickup request for '" + donation.getFoodDescription() + "' has been cancelled.",
                        type, donation.getDonationId());
            }
            default -> { /* DONATION_CREATED handled by separate listener */ }
        }
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    public Page<NotificationDTO> getNotificationsForUser(Long userId, int page, int size) {
        return notificationRepository
                .findByRecipientUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public Page<NotificationDTO> getUnreadNotificationsForUser(Long userId, int page, int size) {
        return notificationRepository
                .findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientUserIdAndIsReadFalse(userId);
    }

    // ── Mutations ─────────────────────────────────────────────────────────────

    @Transactional
    public NotificationDTO markSingleRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        notification.setRead(true);
        return toDTO(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void save(User recipient, String title, String message, NotificationType type, Long donationId) {
        notificationRepository.save(new Notification(recipient, title, message, type, donationId));
    }

    public NotificationDTO toDTO(Notification n) {
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
