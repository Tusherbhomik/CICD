package com.prescription.dto;

import com.prescription.entity.User;
import com.prescription.entity.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {
    // User data
    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private User.Gender gender;
    private String profileImage;
    private Boolean isVerified;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;

    // Patient-specific data
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private Patient.BloodType bloodType;
    private LocalDateTime patientCreatedAt;
    private LocalDateTime patientUpdatedAt;
}