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
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@Tag(name = "Donations", description = "Food donation management")
@SecurityRequirement(name = "bearerAuth")
public class DonationController {

    @Autowired
    private FoodDonationService donationService;

    /**
     * Create a donation with an optional image in one multipart request.
     * Content-Type: multipart/form-data
     * Fields: donation (JSON part) + image (file part, optional)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DONOR')")
    @Operation(summary = "Create a donation with optional image upload (DONOR only)")
    public ApiResponse<FoodDonationDTO> createDonation(
            @RequestPart("donation") @Valid FoodDonationDTO donationDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ApiResponse.success("Donation created", donationService.createDonation(donationDTO, image));
    }

    /**
     * Upload or replace the image for an existing donation.
     * Content-Type: multipart/form-data
     */
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DONOR') and @donationService.isDonorOwner(#id, authentication.name))")
    @Operation(summary = "Upload or replace donation image (DONOR owns it, ADMIN any)")
    public ApiResponse<FoodDonationDTO> uploadImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image) {
        return ApiResponse.success("Image uploaded", donationService.uploadImage(id, image));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO', 'VOLUNTEER')")
    @Operation(summary = "List all donations (ADMIN, NGO, VOLUNTEER)")
    public ApiResponse<List<FoodDonationDTO>> getAllDonations() {
        return ApiResponse.success(donationService.getAllDonations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get donation by ID (all authenticated roles)")
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
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DONOR') and @donationService.isDonorOwner(#donorId, authentication.name))")
    @Operation(summary = "Get donations by donor — DONOR sees own only, ADMIN sees any")
    public ApiResponse<List<FoodDonationDTO>> getByDonor(@PathVariable Long donorId) {
        return ApiResponse.success(donationService.getDonationsByDonor(donorId));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search donations — filters: keyword, foodType, city, status, donorId, dateFrom, dateTo | sort: createdAt | quantity | expiryDate | dir: asc | desc")
    public ApiResponse<Page<FoodDonationDTO>> search(@ModelAttribute DonationFilterDTO filter) {
        return ApiResponse.success(donationService.search(filter));
    }

    @PatchMapping("/{id}/advance")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Advance donation status manually (ADMIN only)")
    public ApiResponse<FoodDonationDTO> advanceStatus(@PathVariable Long id) {
        return ApiResponse.success("Status updated", donationService.advanceStatus(id));
    }
}
