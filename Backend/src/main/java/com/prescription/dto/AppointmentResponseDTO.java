package com.prescription.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class AppointmentResponseDTO {

    private Long id;
    private LocalDateTime scheduledTime;
    private String status;
    private String type;
    private String notes;
    private String reason;
    private String preferredTimeSlot;
    private String location;
    private LocalDateTime requestDate;
    private LocalDateTime followupDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, Object> doctor;
    private Map<String, Object> patient;

    // Constructors
    public AppointmentResponseDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getPreferredTimeSlot() {
        return preferredTimeSlot;
    }

    public void setPreferredTimeSlot(String preferredTimeSlot) {
        this.preferredTimeSlot = preferredTimeSlot;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public LocalDateTime getFollowupDate() {
        return followupDate;
    }

    public void setFollowupDate(LocalDateTime followupDate) {
        this.followupDate = followupDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Map<String, Object> getDoctor() {
        return doctor;
    }

    public void setDoctor(Map<String, Object> doctor) {
        this.doctor = doctor;
    }

    public Map<String, Object> getPatient() {
        return patient;
    }

    public void setPatient(Map<String, Object> patient) {
        this.patient = patient;
    }
}
