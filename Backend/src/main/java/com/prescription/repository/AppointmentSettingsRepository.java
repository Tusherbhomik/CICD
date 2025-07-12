package com.prescription.repository;

import com.prescription.entity.AppointmentSettings;
import com.prescription.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppointmentSettingsRepository extends JpaRepository<AppointmentSettings, Long> {

    Optional<AppointmentSettings> findByDoctor(User doctor);
    Optional<AppointmentSettings> findByDoctorId(Long doctorId);
    boolean existsByDoctorId(Long doctorId);
    void deleteByDoctorId(Long doctorId);
}