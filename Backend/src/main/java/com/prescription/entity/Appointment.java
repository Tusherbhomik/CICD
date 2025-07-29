package com.prescription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// Appointment Entity
@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
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


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "date_time", nullable = false)
    private String dateandtime;  /// date,time slot,day



    public Appointment(LocalDateTime scheduledTime, Type type, User doctor, User patient,Hospital hospital,String dateandtime) {
        this.scheduledTime = scheduledTime;
        this.type = type;
        this.doctor = doctor;
        this.patient = patient;
        this.hospital  =hospital;
        this.dateandtime=dateandtime;
    }

    // Enums
    public enum Status {
        REQUESTED, SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
    }

    public enum Type {
        IN_PERSON, VIDEO, PHONE
    }
}
