package com.prescription.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.prescription.entity.AvailabilityTemplate;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Data
public class AvailabilityTemplateDTO {
    private Long id;
    private String templateName;
    private String scheduleType;
    private LocalTime startTime;
    private LocalTime endTime;
    private Set<Integer> daysOfWeek;
    private LocalDate startDate;
    private LocalDate endDate;
    private Set<LocalDate> specificDates;
    @JsonProperty("isActive")
    private boolean isActive;
    private Integer priority;
}