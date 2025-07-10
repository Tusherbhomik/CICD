package com.prescription.dto;

import lombok.Data;

@Data
public class AppointmentSettingsDTO {
    private Long id;
    private boolean autoApprove;
    private boolean allowOverbooking;
    private Integer slotDurationMinutes;
    private Integer advanceBookingDays;
    private Integer bufferTimeMinutes;
}