package com.prescription.dto;

import com.prescription.entity.DoctorAvailabilitySlot;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DoctorAvailabilitySlotDTO {
    private Long id;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private DoctorAvailabilitySlot.SlotStatus slotStatus;
    private Long generatedFromTemplateId;
}