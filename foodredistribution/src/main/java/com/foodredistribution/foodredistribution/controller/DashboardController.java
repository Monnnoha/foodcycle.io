package com.foodredistribution.foodredistribution.controller;

import com.foodredistribution.foodredistribution.dto.AdminDashboardDTO;
import com.foodredistribution.foodredistribution.dto.ApiResponse;
import com.foodredistribution.foodredistribution.dto.DonorDashboardDTO;
import com.foodredistribution.foodredistribution.dto.VolunteerDashboardDTO;
import com.foodredistribution.foodredistribution.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Role-specific platform statistics")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * Admin dashboard — platform-wide totals.
     * Returns: total users, total donations, available donations,
     *          active pickups (REQUESTED+PICKED), completed deliveries.
     */
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO')")
    @Operation(summary = "Admin/NGO platform statistics (ADMIN, NGO)")
    public ApiResponse<AdminDashboardDTO> getAdminDashboard() {
        return ApiResponse.success(dashboardService.getAdminDashboard());
    }

    /**
     * Donor dashboard — stats scoped to the authenticated donor.
     * Returns: my donations, available, pending pickups, completed.
     */
    @GetMapping("/donor/{donorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DONOR') and authentication.name == @userService.getEmailById(#donorId))")
    @Operation(summary = "Donor's own donation statistics (DONOR sees own, ADMIN sees any)")
    public ApiResponse<DonorDashboardDTO> getDonorDashboard(@PathVariable Long donorId) {
        return ApiResponse.success(dashboardService.getDonorDashboard(donorId));
    }

    /**
     * Volunteer dashboard — stats scoped to the authenticated volunteer.
     * Returns: total assigned, active pickups, completed pickups.
     */
    @GetMapping("/volunteer/{volunteerId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('VOLUNTEER') and authentication.name == @userService.getEmailById(#volunteerId))")
    @Operation(summary = "Volunteer's own pickup statistics (VOLUNTEER sees own, ADMIN sees any)")
    public ApiResponse<VolunteerDashboardDTO> getVolunteerDashboard(@PathVariable Long volunteerId) {
        return ApiResponse.success(dashboardService.getVolunteerDashboard(volunteerId));
    }
}
