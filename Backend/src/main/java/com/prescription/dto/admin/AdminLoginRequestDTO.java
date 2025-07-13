package com.prescription.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// ============ LOGIN DTOs ============

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginRequestDTO {

    @Email(message = "Please provide a valid email address")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private boolean rememberMe = false;
}

// ============ SIGNUP DTOs ============

// ============ COMMON DTOs ============

// ============ ADMIN MANAGEMENT DTOs ============

