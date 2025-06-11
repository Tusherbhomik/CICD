package com.prescription.dto;

import java.util.List;

public class PrescriptionMedicineDto {
    private Long id;
    private MedicineSearchDto medicine;
    private Integer durationDays;
    private String specialInstructions;
    private List<MedicineTimingDto> timings;

    // Constructors and getters/setters follow same pattern
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MedicineSearchDto getMedicine() {
        return medicine;
    }

    public void setMedicine(MedicineSearchDto medicine) {
        this.medicine = medicine;
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

    public List<MedicineTimingDto> getTimings() {
        return timings;
    }

    public void setTimings(List<MedicineTimingDto> timings) {
        this.timings = timings;
    }
}
