package com.prescription.repository;

import com.prescription.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

// Prescription Repository
@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByDoctorId(Long doctorId);

    List<Prescription> findByDoctorIdOrderByUpdatedAtDesc(Long doctorId);

    List<Prescription> findByPatientId(Long patientId);

    List<Prescription> findByDoctorIdAndPatientId(Long doctorId, Long patientId);

    @Query("SELECT DISTINCT p.patient.id FROM Prescription p WHERE p.doctor.id = :doctorId")
    Set<Long> findPatientIdsByDoctorId(Long doctorId);
}
