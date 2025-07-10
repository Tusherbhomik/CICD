package com.prescription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a patient in the prescription system, linked to a User entity.
 * Includes physical attributes and blood type, with audit timestamps.
 */
@Getter
@Setter
@Entity
@Table(name = "patients")
@EntityListeners(AuditingEntityListener.class)
public class Patient {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @NotNull
    @Column(name = "height_cm", nullable = false)
    private BigDecimal heightCm;

    @NotNull
    @Column(name = "weight_kg", nullable = false)
    private BigDecimal weightKg;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "blood_type", nullable = false)
    private BloodType bloodType = BloodType.UNKNOWN;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Patient() {
    }

    public Patient(Long userId, BigDecimal heightCm, BigDecimal weightKg, BloodType bloodType) {
        this.userId = userId;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
        this.bloodType = bloodType;
    }

    // Enum for blood types
    public enum BloodType {
        A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE,
        AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE, UNKNOWN
    }
}
