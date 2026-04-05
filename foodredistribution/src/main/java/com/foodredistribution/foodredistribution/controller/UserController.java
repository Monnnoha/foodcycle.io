package com.foodredistribution.foodredistribution.controller;

import com.foodredistribution.foodredistribution.dto.ApiResponse;
import com.foodredistribution.foodredistribution.dto.UpdateUserRequest;
import com.foodredistribution.foodredistribution.dto.UserDTO;
import com.foodredistribution.foodredistribution.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    @Autowired
    private UserService userService;

    // ADMIN lists all users with pagination
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users with pagination (ADMIN only)")
    public ApiResponse<Page<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(userService.getAllUsers(page, size));
    }

    // ADMIN can view any profile; users can view their own
    // Uses getEmailById() to avoid double-loading the user in SpEL
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == @userService.getEmailById(#id)")
    @Operation(summary = "Get user profile — own profile or ADMIN")
    public ApiResponse<UserDTO> getUserById(@PathVariable Long id) {
        return ApiResponse.success(userService.getUserById(id));
    }

    // ADMIN can update any profile; users can update their own
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == @userService.getEmailById(#id)")
    @Operation(summary = "Update name and phone — own profile or ADMIN")
    public ApiResponse<UserDTO> updateUser(@PathVariable Long id,
                                           @Valid @RequestBody UpdateUserRequest request) {
        return ApiResponse.success("Profile updated", userService.updateUser(id, request));
    }
}
