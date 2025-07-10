package com.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateDoctorRequest {
    @NotBlank
    private String name;
    private String email;
    private String phone;
    private String institute;         // New field for DOCTORS table
    private String licenseNumber;     // New field for DOCTORS table
    private String specialization;
}
