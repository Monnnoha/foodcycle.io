package com.foodredistribution.foodredistribution.dto;

import com.foodredistribution.foodredistribution.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotNull(message = "Role is required")
    private UserRole role;

    /** Optional — phone number for all roles */
    private String phone;

    /** Optional — organization name for NGO / business donor */
    private String orgName;
}
