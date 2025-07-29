package com.prescription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// Appointment Entity
@Data
@Entity
@Table(name = "appointments")
@EntityListeners(AuditingEntityListener.class)
public class Appointment {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    private Status status=Status.SCHEDULED ;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    private Type type;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_user_id", nullable = false)
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_user_id", nullable = false)
    private User patient;

    @Column(name = "followup_date")
    private LocalDateTime followupDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // start time  end time  hospitalid


    // Constructors
    public Appointment() {
    }

    public Appointment(LocalDateTime scheduledTime, Type type, User doctor, User patient) {
        this.scheduledTime = scheduledTime;
        this.type = type;
        this.doctor = doctor;
        this.patient = patient;
    }

    // Enums
    public enum Status {
        REQUESTED, SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
    }

    public enum Type {
        IN_PERSON, VIDEO, PHONE
    }
}
