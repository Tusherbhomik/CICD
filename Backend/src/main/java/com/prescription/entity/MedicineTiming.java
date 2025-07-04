package com.prescription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

// Medicine Timing Entity
@Data
@Entity
@Table(name = "medicine_timings")
@EntityListeners(AuditingEntityListener.class)
public class MedicineTiming {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_medicine_id", nullable = false)
    private PrescriptionMedicine prescriptionMedicine;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "meal_relation", nullable = false)
    private MealRelation mealRelation;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "time_of_day", nullable = false)
    private TimeOfDay timeOfDay;

    @NotNull
    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "specific_time")
    private LocalTime specificTime;

    @Column(name = "interval_hours")
    private Integer intervalHours;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public MedicineTiming() {
    }

    public MedicineTiming(PrescriptionMedicine prescriptionMedicine, MealRelation mealRelation,
                          TimeOfDay timeOfDay, BigDecimal amount) {
        this.prescriptionMedicine = prescriptionMedicine;
        this.mealRelation = mealRelation;
        this.timeOfDay = timeOfDay;
        this.amount = amount;
    }

    // Enums
    public enum MealRelation {
        BEFORE_MEAL, AFTER_MEAL, WITH_MEAL, EMPTY_STOMACH, ANY_TIME
    }

    public enum TimeOfDay {
        MORNING, AFTERNOON, EVENING, NIGHT, BEDTIME, FIXED_TIME, INTERVAL
    }
}
