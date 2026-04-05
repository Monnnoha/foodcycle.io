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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DONOR')")
    @Operation(summary = "Create a donation (DONOR only)")
    public ApiResponse<FoodDonationDTO> createDonation(@Valid @RequestBody FoodDonationDTO donationDTO) {
        return ApiResponse.success("Donation created", donationService.createDonation(donationDTO));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER')")
    @Operation(summary = "Get all donations (ADMIN, NGO, VOLUNTEER)")
    public ApiResponse<List<FoodDonationDTO>> getAllDonations() {
        return ApiResponse.success(donationService.getAllDonations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER', 'DONOR')")
    @Operation(summary = "Get donation by ID")
    public ApiResponse<FoodDonationDTO> getDonation(@PathVariable Long id) {
        return ApiResponse.success(donationService.getDonation(id));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER')")
    @Operation(summary = "Get donations by status (ADMIN, NGO, VOLUNTEER)")
    public ApiResponse<List<FoodDonationDTO>> getByStatus(@PathVariable DonationStatus status) {
        return ApiResponse.success(donationService.getDonationsByStatus(status));
    }

    @GetMapping("/donor/{donorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DONOR') and #donorId == authentication.principal.username)")
    @Operation(summary = "Get own donations (DONOR) or any donor's donations (ADMIN)")
    public ApiResponse<List<FoodDonationDTO>> getByDonor(@PathVariable Long donorId) {
        return ApiResponse.success(donationService.getDonationsByDonor(donorId));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER', 'DONOR')")
    @Operation(summary = "Search donations with filters and pagination")
    public ApiResponse<org.springframework.data.domain.Page<FoodDonationDTO>> search(@ModelAttribute DonationFilterDTO filter) {
        return ApiResponse.success(donationService.search(filter));
    }

    @PatchMapping("/{id}/advance")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Advance donation status (ADMIN only)")
    public ApiResponse<FoodDonationDTO> advanceStatus(@PathVariable Long id) {
        return ApiResponse.success("Status updated", donationService.advanceStatus(id));
    }
}
