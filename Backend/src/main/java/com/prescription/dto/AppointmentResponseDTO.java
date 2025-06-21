package com.prescription.dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
public class AppointmentResponseDTO {
    private Long id;
    private LocalDateTime scheduledTime;
    private String status;
    private String type;
    private String notes;;
    private String preferredTimeSlot;
    private LocalDateTime requestDate;
    private LocalDateTime followupDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, Object> doctor;
    private Map<String, Object> patient;
}
