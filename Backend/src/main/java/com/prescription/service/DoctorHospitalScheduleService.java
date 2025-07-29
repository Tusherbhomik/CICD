package com.prescription.service;

import com.prescription.dto.DoctorHospitalScheduleDto;
import com.prescription.entity.DoctorHospitalSchedule;
import com.prescription.repository.DoctorHospitalScheduleRepository;
import com.prescription.repository.DoctorRepository;
import com.prescription.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorHospitalScheduleService {

    private final DoctorHospitalScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;

    public List<DoctorHospitalScheduleDto> getSchedulesByDoctorAndHospitalAndDay(
            Long doctorId, Long hospitalId, String dayOfWeek) {
        if (hospitalId == null && dayOfWeek == null) {
            return scheduleRepository.findByDoctorId(doctorId).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } else if (hospitalId != null && dayOfWeek != null) {
            return scheduleRepository.findByDoctorIdAndHospitalIdAndDayOfWeek(
                            doctorId, hospitalId, dayOfWeek.toUpperCase()).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } else if (hospitalId != null) {
            return scheduleRepository.findByDoctorIdAndHospitalId(doctorId, hospitalId).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } else {
            return scheduleRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek.toUpperCase()).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public DoctorHospitalScheduleDto createSchedule(DoctorHospitalScheduleDto scheduleDto) {
        validateDoctorAndHospital(scheduleDto.getDoctorId(), scheduleDto.getHospitalId());
        //validateFields(scheduleDto.getDayOfWeek(), scheduleDto.getTimeSlots(), scheduleDto.getConsultationFee());

        // Check for existing schedule for the same doctor, hospital, and day
        List<DoctorHospitalSchedule> existingSchedules = scheduleRepository
                .findByDoctorIdAndHospitalIdAndDayOfWeek(
                        scheduleDto.getDoctorId(),
                        scheduleDto.getHospitalId(),
                        scheduleDto.getDayOfWeek().toUpperCase());
        if (!existingSchedules.isEmpty()) {
            throw new RuntimeException("Schedule already exists for this day");
        }

        DoctorHospitalSchedule schedule = new DoctorHospitalSchedule();
        schedule.setDoctorId(scheduleDto.getDoctorId());
        schedule.setHospitalId(scheduleDto.getHospitalId());
        schedule.setDayOfWeek(scheduleDto.getDayOfWeek().toUpperCase());
        schedule.setTimeSlots(scheduleDto.getTimeSlots());


        DoctorHospitalSchedule savedSchedule = scheduleRepository.save(schedule);
        return convertToDto(savedSchedule);
    }

    @Transactional
    public DoctorHospitalScheduleDto updateSchedule(Long id, DoctorHospitalScheduleDto scheduleDto) {
        DoctorHospitalSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        validateDoctorAndHospital(scheduleDto.getDoctorId(), scheduleDto.getHospitalId());
        validateFields(scheduleDto.getDayOfWeek(), scheduleDto.getTimeSlots(), 0.0);

        // Check if updating to a day that already has a schedule
        List<DoctorHospitalSchedule> existingSchedules = scheduleRepository
                .findByDoctorIdAndHospitalIdAndDayOfWeek(
                        scheduleDto.getDoctorId(),
                        scheduleDto.getHospitalId(),
                        scheduleDto.getDayOfWeek().toUpperCase());
        if (existingSchedules.stream().anyMatch(s -> !s.getId().equals(id))) {
            throw new RuntimeException("Another schedule already exists for this day");
        }

        schedule.setDoctorId(scheduleDto.getDoctorId());
        schedule.setHospitalId(scheduleDto.getHospitalId());
        schedule.setDayOfWeek(scheduleDto.getDayOfWeek().toUpperCase());
        schedule.setTimeSlots(scheduleDto.getTimeSlots());


        DoctorHospitalSchedule updatedSchedule = scheduleRepository.save(schedule);
        return convertToDto(updatedSchedule);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        DoctorHospitalSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        scheduleRepository.delete(schedule);
    }

    private void validateDoctorAndHospital(Long doctorId, Long hospitalId) {
        doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
    }

    private void validateFields(String dayOfWeek, String timeSlots, Double consultationFee) {
        if (dayOfWeek == null || dayOfWeek.trim().isEmpty()) {
            throw new RuntimeException("Day of week cannot be empty");
        }
        if (timeSlots == null || timeSlots.trim().isEmpty()) {
            throw new RuntimeException("Time slots cannot be empty");
        }

    }

    private DoctorHospitalScheduleDto convertToDto(DoctorHospitalSchedule schedule) {
        DoctorHospitalScheduleDto dto = new DoctorHospitalScheduleDto();
        dto.setId(schedule.getId());
        dto.setDoctorId(schedule.getDoctorId());
        dto.setHospitalId(schedule.getHospitalId());
        dto.setDayOfWeek(schedule.getDayOfWeek());
        dto.setTimeSlots(schedule.getTimeSlots());

        return dto;
    }
}