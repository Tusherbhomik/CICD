package com.prescription.dto;

import com.prescription.entity.User;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Builder
@Data
public class SignUpRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be 3–50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String phone;                       // optional

    @NotNull(message = "Role is required")
    private User.Role role;                     // DOCTOR or PATIENT

    @NotNull(message = "Birth-date is required")
    @Past(message = "Birth-date must be in the past")
    private LocalDate birthDate;

    @NotNull(message = "Gender is required")
    private User.Gender gender;                 // MALE, FEMALE, OTHER
}
