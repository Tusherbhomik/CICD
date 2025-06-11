package com.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

// Prescription DTOs
public class PrescriptionCreateDto {
    @NotBlank
    private String diagnosis;

    @NotNull
    private Long patientId;

    private LocalDate followUpDate;

    private String advice;

    @NotEmpty
    private List<PrescriptionMedicineCreateDto> medicines;

    // Constructors
    public PrescriptionCreateDto() {
    }

    // Getters and Setters
    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public String getAdvice() {
        return advice;
    }

    public void setAdvice(String advice) {
        this.advice = advice;
    }

    public List<PrescriptionMedicineCreateDto> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<PrescriptionMedicineCreateDto> medicines) {
        this.medicines = medicines;
    }
}
