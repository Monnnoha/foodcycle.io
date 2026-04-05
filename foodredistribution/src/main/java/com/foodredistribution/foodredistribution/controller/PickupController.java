package com.foodredistribution.foodredistribution.controller;

import com.foodredistribution.foodredistribution.dto.ApiResponse;
import com.foodredistribution.foodredistribution.dto.FoodDonationDTO;
import com.foodredistribution.foodredistribution.dto.PickupRequestDTO;
import com.foodredistribution.foodredistribution.dto.UpdatePickupRequest;
import com.foodredistribution.foodredistribution.service.PickupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pickups")
@Tag(name = "Pickups", description = "Pickup request management")
@SecurityRequirement(name = "bearerAuth")
public class PickupController {

    @Autowired
    private PickupService pickupService;

    // ── CRUD ────────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER')")
    @Operation(summary = "List all pickups with pagination (ADMIN, NGO, VOLUNTEER)")
    public ApiResponse<Page<PickupRequestDTO>> getAllPickups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(pickupService.getAllPickups(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER', 'DONOR')")
    @Operation(summary = "Get pickup by ID")
    public ApiResponse<PickupRequestDTO> getPickupById(@PathVariable Long id) {
        return ApiResponse.success(pickupService.getPickupById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    @Operation(summary = "Reassign volunteer/NGO on a pickup (ADMIN or VOLUNTEER, only while REQUESTED)")
    public ApiResponse<PickupRequestDTO> updatePickup(@PathVariable Long id,
                                                      @Valid @RequestBody UpdatePickupRequest request) {
        return ApiResponse.success("Pickup updated", pickupService.updatePickup(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cancel and delete a pickup (ADMIN only, only while REQUESTED)")
    public void cancelPickup(@PathVariable Long id) {
        pickupService.cancelPickup(id);
    }

    // ── Workflow ─────────────────────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Request a pickup — AVAILABLE → REQUESTED (VOLUNTEER only)")
    public ApiResponse<PickupRequestDTO> requestPickup(@Valid @RequestBody PickupRequestDTO dto) {
        return ApiResponse.success("Pickup requested", pickupService.requestPickup(dto));
    }

    @GetMapping("/donation/{donationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER', 'DONOR')")
    @Operation(summary = "Get pickup details by donation ID")
    public ApiResponse<PickupRequestDTO> getPickupByDonation(@PathVariable Long donationId) {
        return ApiResponse.success(pickupService.getPickupByDonation(donationId));
    }

    @PatchMapping("/donation/{donationId}/pick")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Mark donation as picked up — REQUESTED → PICKED (VOLUNTEER only)")
    public ApiResponse<FoodDonationDTO> markPicked(@PathVariable Long donationId) {
        return ApiResponse.success("Donation marked as picked", pickupService.markPicked(donationId));
    }

    @PatchMapping("/donation/{donationId}/deliver")
    @PreAuthorize("hasAnyRole('NGO', 'VOLUNTEER')")
    @Operation(summary = "Mark donation as delivered — PICKED → DELIVERED (NGO or VOLUNTEER)")
    public ApiResponse<FoodDonationDTO> markDelivered(@PathVariable Long donationId) {
        return ApiResponse.success("Donation marked as delivered", pickupService.markDelivered(donationId));
    }
}
