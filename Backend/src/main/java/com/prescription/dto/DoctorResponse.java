package com.prescription.dto;

import com.prescription.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponse {
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

    private String licenseNumber;
    private String institute;
    private String specialization;
    private LocalDateTime doctorCreatedAt;
    private LocalDateTime doctorUpdatedAt;
}