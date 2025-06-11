package com.prescription.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

public class MedicineTimingDto {
    private Long id;
    private String mealRelation;
    private String timeOfDay;
    private BigDecimal amount;
    private LocalTime specificTime;
    private Integer intervalHours;

    // Getters and setters follow same pattern as above
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
