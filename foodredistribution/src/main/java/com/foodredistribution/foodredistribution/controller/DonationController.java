package com.foodredistribution.foodredistribution.controller;

import com.foodredistribution.foodredistribution.dto.ApiResponse;
import com.foodredistribution.foodredistribution.dto.DonationFilterDTO;
import com.foodredistribution.foodredistribution.dto.FoodDonationDTO;
import com.foodredistribution.foodredistribution.entity.DonationStatus;
import com.foodredistribution.foodredistribution.service.FoodDonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@Tag(name = "Donations", description = "Food donation management")
@SecurityRequirement(name = "bearerAuth")
public class DonationController {

    @Autowired
    private FoodDonationService donationService;

    // DONOR creates a donation
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DONOR')")
    @Operation(summary = "Create a donation (DONOR only)")
    public ApiResponse<FoodDonationDTO> createDonation(@Valid @RequestBody FoodDonationDTO donationDTO) {
        return ApiResponse.success("Donation created", donationService.createDonation(donationDTO));
    }

    // ADMIN, NGO, VOLUNTEER can browse all donations
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER')")
    @Operation(summary = "List all donations (ADMIN, NGO, VOLUNTEER)")
    public ApiResponse<List<FoodDonationDTO>> getAllDonations() {
        return ApiResponse.success(donationService.getAllDonations());
    }

    // Any authenticated user can view a single donation
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get donation by ID (all authenticated roles)")
    public ApiResponse<FoodDonationDTO> getDonation(@PathVariable Long id) {
        return ApiResponse.success(donationService.getDonation(id));
    }

    // ADMIN, NGO, VOLUNTEER can filter by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER')")
    @Operation(summary = "Get donations by status (ADMIN, NGO, VOLUNTEER)")
    public ApiResponse<List<FoodDonationDTO>> getByStatus(@PathVariable DonationStatus status) {
        return ApiResponse.success(donationService.getDonationsByStatus(status));
    }

    // DONOR can view only their own donations; ADMIN can view any donor's
    @GetMapping("/donor/{donorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DONOR') and @donationService.isDonorOwner(#donorId, authentication.name))")
    @Operation(summary = "Get donations by donor — DONOR sees own only, ADMIN sees any")
    public ApiResponse<List<FoodDonationDTO>> getByDonor(@PathVariable Long donorId) {
        return ApiResponse.success(donationService.getDonationsByDonor(donorId));
    }

    // All roles can search with filters
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search donations with filters and pagination (all authenticated roles)")
    public ApiResponse<Page<FoodDonationDTO>> search(@ModelAttribute DonationFilterDTO filter) {
        return ApiResponse.success(donationService.search(filter));
    }

    // ADMIN-only manual status advance (admin tooling / backfill)
    @PatchMapping("/{id}/advance")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Advance donation status manually (ADMIN only)")
    public ApiResponse<FoodDonationDTO> advanceStatus(@PathVariable Long id) {
        return ApiResponse.success("Status updated", donationService.advanceStatus(id));
    }
}
