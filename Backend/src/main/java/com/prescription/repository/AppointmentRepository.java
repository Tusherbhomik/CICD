package com.prescription.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prescription.entity.Appointment;
import com.prescription.entity.User;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Existing methods
    List<Appointment> findByDoctorAndStatus(User doctor, Appointment.Status status);

    List<Appointment> findByPatientAndStatus(User patient, Appointment.Status status);

    List<Appointment> findByDoctorAndStatusIn(User doctor, List<Appointment.Status> statuses);

    // New methods for enhanced functionality
    List<Appointment> findByDoctor(User doctor);

    List<Appointment> findByPatient(User patient);
    // ...existing code...
    List<Appointment> findByScheduledTimeBetweenAndStatus(LocalDateTime start, LocalDateTime end, Appointment.Status status);

    List<Appointment> findByDoctorOrderByCreatedAtDesc(User doctor);

    List<Appointment> findByPatientOrderByCreatedAtDesc(User patient);

    List<Appointment> findByDoctorAndStatusOrderByCreatedAtDesc(User doctor, Appointment.Status status);

    List<Appointment> findByDoctorAndStatusInOrderByScheduledTimeAsc(User doctor, List<Appointment.Status> statuses);

    List<Appointment> findByDoctorAndScheduledTimeBetween(User doctor, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByDoctorAndScheduledTimeBetweenOrderByScheduledTimeAsc(User doctor, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.scheduledTime BETWEEN :startDate AND :endDate ORDER BY a.scheduledTime ASC")
    List<Appointment> findByDoctorAndDateRange(@Param("doctor") User doctor,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor = :doctor AND a.status = :status")
    Long countByDoctorAndStatus(@Param("doctor") User doctor, @Param("status") Appointment.Status status);

    @Query("SELECT COUNT(DISTINCT a.patient) FROM Appointment a WHERE a.doctor = :doctor")
    Long countUniquePatientsForDoctor(@Param("doctor") User doctor);

    //
//    @Query("SELECT a.patient FROM Appointment a JOIN a.patient p WHERE " +
//            "a.doctor= :doctor order by a.createdAt")
//    List<User> findRecentPatientsFromDoctor(@Param("doctor") User doctor);

    @Query("SELECT a.patient FROM Appointment a JOIN a.patient p WHERE a.doctor = :doctor ORDER BY a.createdAt")
    List<User> findRecentPatientsFromDoctor(@Param("doctor") User doctor);

}
