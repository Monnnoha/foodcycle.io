package com.foodredistribution.foodredistribution.dto;

import com.foodredistribution.foodredistribution.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long notificationId;
    private String title;
    private String message;
    private boolean isRead;
    private NotificationType type;
    private Long donationId;
    private LocalDateTime createdAt;
}
