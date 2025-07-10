// AppointmentSettings.java
package com.prescription.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "appointment_settings")
@Data
public class AppointmentSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "doctor_id", unique = true)
    private User doctor;

    private boolean autoApprove;

    private boolean allowOverbooking;

    @Column(name = "slot_duration_minutes")
    private Integer slotDurationMinutes = 30; // Default 30 minutes per slot

    @Column(name = "advance_booking_days")
    private Integer advanceBookingDays = 30; // How many days in advance patients can book

    @Column(name = "buffer_time_minutes")
    private Integer bufferTimeMinutes = 5; // Buffer time between appointments
}