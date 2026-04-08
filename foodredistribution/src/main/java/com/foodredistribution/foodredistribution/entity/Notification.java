package com.foodredistribution.foodredistribution.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notifications",
       indexes = @Index(name = "idx_notification_user", columnList = "user_id"))
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_notification_user"))
    private User recipient;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    // Optional reference to the related donation
    private Long donationId;

    public Notification(User recipient, String title, String message, NotificationType type, Long donationId) {
        this.recipient = recipient;
        this.title = title;
        this.message = message;
        this.type = type;
        this.donationId = donationId;
    }
}
