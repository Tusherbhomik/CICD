package com.prescription.dto;

import com.prescription.entity.AvailabilityException;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AvailabilityExceptionDTO {
    private Long id;
    private LocalDate exceptionDate;
    private AvailabilityException.ExceptionType exceptionType;
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
}