package com.prescription.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "doctor_hospital_schedules")
@EntityListeners(AuditingEntityListener.class)
public class DoctorHospitalSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek; // e.g., "MONDAY", "TUESDAY"

    @Column(name = "time_slots", nullable = false)
    private String timeSlots; // e.g., "09:00,09:30,10:00"
}