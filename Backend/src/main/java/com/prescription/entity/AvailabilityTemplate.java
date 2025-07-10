package com.prescription.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_templates")
@Data
public class AvailabilityTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @Column(name = "template_name")
    private String templateName; // e.g., "Morning Clinic", "Evening Hours"

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type")
    private ScheduleType scheduleType;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    // For WEEKLY schedule type
    @Column(name = "days_of_week")
    private String daysOfWeek; // Comma-separated: "1,2,3,4,5" for Mon-Fri

    // For SPECIFIC_DATE_RANGE schedule type
    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // For SPECIFIC_DATES schedule type
    @Column(name = "specific_dates")
    private String specificDates; // Comma-separated dates: "2024-01-15,2024-01-20"

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "priority")
    private Integer priority = 0; // Higher priority templates override lower ones

    public enum ScheduleType {
        DAILY,           // Available every day
        WEEKLY,          // Available on specific days of the week
        SPECIFIC_DATE_RANGE,  // Available within a date range
        SPECIFIC_DATES   // Available on specific dates only
    }
}
