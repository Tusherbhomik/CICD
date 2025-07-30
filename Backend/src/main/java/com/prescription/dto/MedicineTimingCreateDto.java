package com.prescription.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class MedicineTimingCreateDto {
    // Getters and Setters
    @NotNull
    private String mealRelation; // BEFORE_MEAL, AFTER_MEAL, etc.

    @NotNull
    private String timeOfDay; // MORNING, AFTERNOON, etc.

    @NotNull
    @DecimalMin("0.1")
    private BigDecimal amount;

    private LocalTime specificTime;

    private Integer intervalHours;

    // Constructors
    public MedicineTimingCreateDto() {
    }

}
