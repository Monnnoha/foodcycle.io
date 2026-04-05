package com.foodredistribution.foodredistribution.controller;

import com.foodredistribution.foodredistribution.dto.ApiResponse;
import com.foodredistribution.foodredistribution.dto.NotificationDTO;
import com.foodredistribution.foodredistribution.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "User notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Users fetch their own notifications; ADMIN can fetch any user's
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == @userService.getEmailById(#userId)")
    @Operation(summary = "Get paginated notifications for a user (own or ADMIN)")
    public ApiResponse<Page<NotificationDTO>> getNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(notificationService.getNotificationsForUser(userId, page, size));
    }

    // Unread badge count — own or ADMIN
    @GetMapping("/user/{userId}/unread-count")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == @userService.getEmailById(#userId)")
    @Operation(summary = "Get unread notification count (own or ADMIN)")
    public ApiResponse<Long> getUnreadCount(@PathVariable Long userId) {
        return ApiResponse.success(notificationService.getUnreadCount(userId));
    }

    // Mark all read — own or ADMIN
    @PatchMapping("/user/{userId}/mark-all-read")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == @userService.getEmailById(#userId)")
    @Operation(summary = "Mark all notifications as read (own or ADMIN)")
    public ApiResponse<Void> markAllRead(@PathVariable Long userId) {
        notificationService.markAllRead(userId);
        return ApiResponse.success("All notifications marked as read", null);
    }
}
