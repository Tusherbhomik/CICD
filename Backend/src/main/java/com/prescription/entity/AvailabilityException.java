package com.prescription.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_exceptions")
@Data
public class AvailabilityException {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @Column(name = "exception_date")
    private LocalDate exceptionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "exception_type")
    private ExceptionType exceptionType;

    // For UNAVAILABLE type - doctor is not available
    // For CUSTOM_HOURS type - doctor has different hours
    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "reason")
    private String reason; // e.g., "Vacation", "Conference", "Emergency"

    public enum ExceptionType {
        UNAVAILABLE,    // Doctor is not available on this date
        CUSTOM_HOURS    // Doctor has different working hours on this date
    }
}
