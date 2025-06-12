package com.prescription.dto;

import com.prescription.entity.Appointment;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AppointmentScheduleDTO {

    @NotNull(message = "Scheduled time is required")
    @Future(message = "Scheduled time must be in the future")
    private LocalDateTime scheduledTime;

    @NotNull(message = "Appointment type is required")
    private Appointment.Type type;

    @NotBlank(message = "Location is required")
    private String location;

    private String notes;

    // Constructors
    public AppointmentScheduleDTO() {
    }

    public AppointmentScheduleDTO(LocalDateTime scheduledTime, Appointment.Type type, String location, String notes) {
        this.scheduledTime = scheduledTime;
        this.type = type;
        this.location = location;
        this.notes = notes;
    }

    // Getters and Setters
    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public Appointment.Type getType() {
        return type;
    }

    public void setType(Appointment.Type type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
