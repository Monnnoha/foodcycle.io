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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "User notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.foodredistribution.foodredistribution.repository.UserRepository userRepository;

    /**
     * GET /api/notifications
     * Returns paginated notifications for the currently authenticated user.
     * No userId in path — resolved from JWT principal.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notifications for the current user")
    public ApiResponse<Page<NotificationDTO>> getMyNotifications(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = resolveUserId(principal);
        return ApiResponse.success(notificationService.getNotificationsForUser(userId, page, size));
    }

    /**
     * GET /api/notifications/unread
     * Returns only unread notifications for the current user.
     */
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread notifications for the current user")
    public ApiResponse<Page<NotificationDTO>> getUnreadNotifications(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = resolveUserId(principal);
        return ApiResponse.success(notificationService.getUnreadNotificationsForUser(userId, page, size));
    }

    /**
     * PUT /api/notifications/{id}/read
     * Marks a single notification as read. User can only mark their own.
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark a single notification as read")
    public ApiResponse<NotificationDTO> markRead(@PathVariable Long id) {
        return ApiResponse.success("Notification marked as read", notificationService.markSingleRead(id));
    }

    /**
     * GET /api/notifications/unread-count
     * Returns the unread badge count for the current user.
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread notification count for the current user")
    public ApiResponse<Long> getUnreadCount(@AuthenticationPrincipal UserDetails principal) {
        Long userId = resolveUserId(principal);
        return ApiResponse.success(notificationService.getUnreadCount(userId));
    }

    /**
     * PATCH /api/notifications/mark-all-read
     * Marks all notifications as read for the current user.
     */
    @PatchMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read for the current user")
    public ApiResponse<Void> markAllRead(@AuthenticationPrincipal UserDetails principal) {
        Long userId = resolveUserId(principal);
        notificationService.markAllRead(userId);
        return ApiResponse.success("All notifications marked as read", null);
    }

    // Admin endpoints — access any user's notifications by userId
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get notifications for any user (ADMIN only)")
    public ApiResponse<Page<NotificationDTO>> getUserNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(notificationService.getNotificationsForUser(userId, page, size));
    }

    // ── helper ────────────────────────────────────────────────────────────────

    private Long resolveUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new com.foodredistribution.foodredistribution.exception
                        .ResourceNotFoundException("User not found: " + principal.getUsername()))
                .getUserId();
    }
}
