package com.prescription.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import com.prescription.entity.Appointment;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime appointmentTime;

    @NotNull(message = "Appointment type is required")
    private Appointment.Type type;

    @NotBlank(message = "Reason for visit is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    // Default constructor
    public AppointmentRequestDTO() {}

    // Constructor with all fields
    public AppointmentRequestDTO(Long patientId, Long doctorId, LocalDate appointmentDate,
                                 LocalTime appointmentTime, Appointment.Type type, String reason) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.type = type;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public Appointment.Type getType() {
        return type;
    }

    public void setType(Appointment.Type type) {
        this.type = type;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    @Override
    public String toString() {
        return "AppointmentRequestDTO{" +
                "patientId=" + patientId +
                ", doctorId=" + doctorId +
                ", appointmentDate=" + appointmentDate +
                ", appointmentTime=" + appointmentTime +
                ", type=" + type +
                ", reason='" + reason + '\'' +
                '}';
    }

}
