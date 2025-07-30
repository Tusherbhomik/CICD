package com.prescription.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
public class PrescriptionMedicineCreateDto {
    // Getters and Setters
    @NotNull
    private Long medicineId;

    @NotNull
    @Min(1)
    private Integer durationDays;

    private String specialInstructions;

    @NotEmpty
    private List<MedicineTimingCreateDto> timings;

    // Constructors
    public PrescriptionMedicineCreateDto() {
    }

}
