package com.prescription.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class PrescriptionMedicineCreateDto {
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

    // Getters and Setters
    public Long getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public List<MedicineTimingCreateDto> getTimings() {
        return timings;
    }

    public void setTimings(List<MedicineTimingCreateDto> timings) {
        this.timings = timings;
    }
}
