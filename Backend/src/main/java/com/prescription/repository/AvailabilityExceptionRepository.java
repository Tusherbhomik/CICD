package com.prescription.repository;

import com.prescription.entity.AvailabilityException;
import com.prescription.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityException, Long> {

    List<AvailabilityException> findByDoctorAndExceptionDateBetween(User doctor, LocalDate startDate, LocalDate endDate);

    Optional<AvailabilityException> findByDoctorAndExceptionDate(User doctor, LocalDate exceptionDate);

    List<AvailabilityException> findByDoctorOrderByExceptionDateDesc(User doctor);
}