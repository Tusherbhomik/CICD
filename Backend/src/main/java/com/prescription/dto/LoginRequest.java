package com.prescription.dto;

import com.prescription.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;


// Authentication DTOs
@Data
public class LoginRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

//    @NotBlank
//    private User.Role role;

    // Constructors
    public LoginRequest() {}

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }
}

