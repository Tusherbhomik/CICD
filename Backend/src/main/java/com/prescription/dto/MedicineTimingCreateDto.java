package com.prescription.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalTime;

public class MedicineTimingCreateDto {
    @NotNull
    private String mealRelation; // BEFORE_MEAL, AFTER_MEAL, etc.

    @NotNull
    private String timeOfDay; // MORNING, AFTERNOON, etc.

    @NotNull
    @DecimalMin("0.1")
    private BigDecimal amount;

    private LocalTime specificTime;

    private Integer intervalHours;

    // Constructors
    public MedicineTimingCreateDto() {
    }

    // Getters and Setters
    public String getMealRelation() {
        return mealRelation;
    }

    public void setMealRelation(String mealRelation) {
        this.mealRelation = mealRelation;
    }

    public String getTimeOfDay() {
        return timeOfDay;
    }

    public void setTimeOfDay(String timeOfDay) {
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
}
