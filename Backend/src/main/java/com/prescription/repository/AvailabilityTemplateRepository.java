package com.prescription.repository;

import com.prescription.entity.AvailabilityTemplate;
import com.prescription.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilityTemplateRepository extends JpaRepository<AvailabilityTemplate, Long> {

    List<AvailabilityTemplate> findByDoctorAndIsActiveOrderByPriorityDesc(User doctor, boolean isActive);

    List<AvailabilityTemplate> findByDoctorOrderByPriorityDesc(User doctor);

    @Query("SELECT at FROM AvailabilityTemplate at WHERE at.doctor = :doctor AND at.isActive = true " +
            "AND ((at.scheduleType = 'DAILY') OR " +
            "(at.scheduleType = 'WEEKLY') OR " +
            "(at.scheduleType = 'SPECIFIC_DATE_RANGE' AND :date BETWEEN at.startDate AND at.endDate) OR " +
            "(at.scheduleType = 'SPECIFIC_DATES' AND at.specificDates LIKE CONCAT('%', :date, '%'))) " +
            "ORDER BY at.priority DESC")
    List<AvailabilityTemplate> findTemplatesForDate(@Param("doctor") User doctor, @Param("date") LocalDate date);
}