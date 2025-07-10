package com.prescription.dto;

import com.prescription.entity.Patient;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdatePatientRequest {

    @NotBlank
    private String name;
    private String email;
    private String phone;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String bloodType;
}
