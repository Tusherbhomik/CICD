package com.prescription.repository;

import com.prescription.entity.DoctorAvailabilitySlot;
import com.prescription.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilitySlotRepository extends JpaRepository<DoctorAvailabilitySlot, Long> {

    List<DoctorAvailabilitySlot> findByDoctorAndSlotDateBetweenOrderBySlotDateAscStartTimeAsc(
            User doctor, LocalDate startDate, LocalDate endDate);

    List<DoctorAvailabilitySlot> findByDoctorAndSlotDateOrderByStartTimeAsc(User doctor, LocalDate slotDate);

    @Query("SELECT das FROM DoctorAvailabilitySlot das WHERE das.doctor = :doctor " +
            "AND das.slotDate = :date AND das.startTime = :startTime AND das.endTime = :endTime")
    List<DoctorAvailabilitySlot> findConflictingSlots(@Param("doctor") User doctor,
                                                      @Param("date") LocalDate date,
                                                      @Param("startTime") LocalTime startTime,
                                                      @Param("endTime") LocalTime endTime);

    void deleteByDoctorAndGeneratedFromTemplateId(User doctor, Long templateId);

    List<DoctorAvailabilitySlot> findByDoctorAndSlotStatusOrderBySlotDateAscStartTimeAsc(
            User doctor, DoctorAvailabilitySlot.SlotStatus status);

    Optional<DoctorAvailabilitySlot> findByDoctorAndSlotDateAndStartTimeAndSlotStatus(
            User doctor, LocalDate slotDate, LocalTime startTime, DoctorAvailabilitySlot.SlotStatus slotStatus);
    List<DoctorAvailabilitySlot> findByDoctorAndSlotDateAndSlotStatus(User doctor, LocalDate slotDate, DoctorAvailabilitySlot.SlotStatus status);
}