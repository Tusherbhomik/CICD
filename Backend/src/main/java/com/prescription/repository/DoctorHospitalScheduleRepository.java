package com.prescription.repository;

import com.prescription.entity.DoctorHospitalSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorHospitalScheduleRepository extends JpaRepository<DoctorHospitalSchedule, Long> {
    List<DoctorHospitalSchedule> findByDoctorIdAndHospitalIdAndDayOfWeek(Long doctorId, Long hospitalId, String dayOfWeek);
    List<DoctorHospitalSchedule> findByDoctorId(Long doctorId);
    List<DoctorHospitalSchedule> findByDoctorIdAndHospitalId(Long doctorId, Long hospitalId);
    List<DoctorHospitalSchedule> findByDoctorIdAndDayOfWeek(Long doctorId, String dayOfWeek);
}