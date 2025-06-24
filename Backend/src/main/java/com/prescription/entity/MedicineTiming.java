package com.prescription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

// Medicine Timing Entity
@Entity
@Table(name = "medicine_timings")
@EntityListeners(AuditingEntityListener.class)
public class MedicineTiming {

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

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PrescriptionMedicine getPrescriptionMedicine() {
        return prescriptionMedicine;
    }

    public void setPrescriptionMedicine(PrescriptionMedicine prescriptionMedicine) {
        this.prescriptionMedicine = prescriptionMedicine;
    }

    public MealRelation getMealRelation() {
        return mealRelation;
    }

    public void setMealRelation(MealRelation mealRelation) {
        this.mealRelation = mealRelation;
    }

    public TimeOfDay getTimeOfDay() {
        return timeOfDay;
    }

    public void setTimeOfDay(TimeOfDay timeOfDay) {
        this.timeOfDay = timeOfDay;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalTime getSpecificTime() {
        return specificTime;
    }

    public void setSpecificTime(LocalTime specificTime) {
        this.specificTime = specificTime;
    }

    public Integer getIntervalHours() {
        return intervalHours;
    }

    public void setIntervalHours(Integer intervalHours) {
        this.intervalHours = intervalHours;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Enums
    public enum MealRelation {
        BEFORE_MEAL, AFTER_MEAL, WITH_MEAL, EMPTY_STOMACH, ANY_TIME
    }

    public enum TimeOfDay {
        MORNING, AFTERNOON, EVENING, NIGHT, BEDTIME, FIXED_TIME, INTERVAL
    }
}
