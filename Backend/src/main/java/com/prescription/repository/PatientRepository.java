package com.prescription.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prescription.entity.Patient;
import com.prescription.entity.User;

// Patient Repository
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(Long userId);
    Optional<Patient> findByUser(User user);
//    List<Patient> findAll();


}

