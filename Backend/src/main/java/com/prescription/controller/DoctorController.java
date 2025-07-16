package com.prescription.controller;

import com.prescription.dto.DoctorResponse;
import com.prescription.dto.UserDto;
import com.prescription.entity.Doctor;
import com.prescription.entity.User;
import com.prescription.repository.AppointmentRepository;
import com.prescription.repository.DoctorRepository;
import com.prescription.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/doctors")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class DoctorController {

    private final UserService userService;
    private final DoctorRepository doctorRepository;

    private final AppointmentRepository appointmentRepository;

//    public DoctorController(UserService userService, DoctorRepository doctorRepository,AppointmentRepository appointmentRepository) {
//        this.userService = userService;
//        this.doctorRepository = doctorRepository;
//    }

    @GetMapping
    public ResponseEntity<?> getAllDoctors() {
        try {
            List<UserDto> patients = userService.getAllDoctors();
            return ResponseEntity.ok(patients);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id) {
        try {
            DoctorResponse doctor = userService.getDoctorBYid(id);
            return ResponseEntity.ok(doctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getDoctor(HttpServletRequest request) {
        try {
            Map<String, Object> response = new HashMap<>();
            Optional<User> optionalUser = userService.getUserById((Long) request.getAttribute("userId"));
            if (optionalUser.isEmpty()) {
                response.put("success", false);
                response.put("message", "Doctor not found");
                return ResponseEntity.badRequest().body(response);
            }
            User user = optionalUser.get();
            Doctor doctor = doctorRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found for user"));

            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("name", user.getName());
            profileData.put("email", user.getEmail());
            profileData.put("phone", user.getPhone());
            profileData.put("role", user.getRole().toString());
            profileData.put("birthDate", user.getBirthDate());
            profileData.put("gender", user.getGender().toString());
            profileData.put("profileImage", user.getProfileImage());
            profileData.put("institute", doctor.getInstitute());
            profileData.put("licenseNumber", doctor.getLicenseNumber());
            profileData.put("specialization", doctor.getSpecialization());
            profileData.put("createdAt", doctor.getCreatedAt());
            profileData.put("updatedAt", doctor.getUpdatedAt());

            return ResponseEntity.ok(profileData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    //get recent  patients
    @GetMapping("/recent-patients")
    public ResponseEntity<?> getDoctorRecentPatients(HttpServletRequest request) {
        List<User> recentPatients =  appointmentRepository.findRecentPatientsFromDoctor(userService.getUserById((Long) request.getAttribute("userId")).get());
        System.out.println(recentPatients);
        return ResponseEntity.ok(recentPatients);
    }

    // Helper class for error responses
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}