package com.prescription.dto;

import com.prescription.entity.Medicine;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class MedicineRequestDto {
    // Getters and Setters
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Generic name is required")
    private String genericName;

    @NotBlank(message = "Strength is required")
    private String strength;

    @NotNull(message = "Form is required")
    private Medicine.Form form;

    @NotNull(message = "Price is required") // Changed to NotNull for number
    private BigDecimal price; // Changed to BigDecimal

    private String manufacturer;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;

}