package com.prescription.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class DoctorHospitalScheduleDto {
    private Long id;
    private Long doctorId;
    private Long hospitalId;
    private String dayOfWeek; // e.g., "MONDAY", "TUESDAY"
    private String timeSlots; // e.g., "09:00,09:30,10:00"
}