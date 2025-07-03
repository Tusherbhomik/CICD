package com.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserRequest {
    @NotBlank
    private String name;
    private String email;
    private String phone;
//    private LocalDate birthDate;
//    private String gender;
}
