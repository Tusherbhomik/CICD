package com.prescription.controller;

import com.prescription.dto.DoctorHospitalScheduleDto;
import com.prescription.entity.DoctorHospitalSchedule;
import com.prescription.repository.DoctorHospitalScheduleRepository;
import com.prescription.service.DoctorHospitalScheduleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedules")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class DoctorHospitalScheduleController {

    private final DoctorHospitalScheduleService scheduleService;
    private final DoctorHospitalScheduleRepository doctorHospitalScheduleRepository;

    @GetMapping("/day")
    public ResponseEntity<List<DoctorHospitalScheduleDto>> getSchedulesByDoctorAndHospitalAndDay(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) String dayOfWeek) {
        List<DoctorHospitalScheduleDto> schedules = scheduleService.getSchedulesByDoctorAndHospitalAndDay(
                doctorId, hospitalId, dayOfWeek);
        return ResponseEntity.ok(schedules);
    }

    @PostMapping
    public ResponseEntity<DoctorHospitalScheduleDto> createSchedule(
            HttpServletRequest request, @RequestBody DoctorHospitalScheduleDto scheduleDto) {
        System.out.println("yes tushar");
        scheduleDto.setDoctorId((Long) request.getAttribute("userId"));
        DoctorHospitalScheduleDto createdSchedule = scheduleService.createSchedule(scheduleDto);
        return ResponseEntity.ok(createdSchedule);
    }

    @GetMapping
    public ResponseEntity<?> getScheduleByDoctorId(
            @RequestParam(required = false) Long id) {
        System.out.println("yes tushar2");
         System.out.println(id);

        List<DoctorHospitalSchedule> schedule = doctorHospitalScheduleRepository.findByDoctorId(2L);

        System.out.println(schedule);
        return ResponseEntity.ok(schedule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorHospitalScheduleDto> updateSchedule(
            @PathVariable Long id,
            @RequestBody DoctorHospitalScheduleDto scheduleDto) {
        DoctorHospitalScheduleDto updatedSchedule = scheduleService.updateSchedule(id, scheduleDto);
        return ResponseEntity.ok(updatedSchedule);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}