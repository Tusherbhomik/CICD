package com.prescription.controller;

import com.prescription.dto.PatientResponse;
import com.prescription.dto.UserDto;
import com.prescription.entity.Patient;
import com.prescription.entity.User;
import com.prescription.repository.PatientRepository;
import com.prescription.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/patients")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PatientController {

    private UserService userService;
    private final PatientRepository patientRepository;

    public PatientController(UserService userService, PatientRepository patientRepository) {
        this.userService = userService;
        this.patientRepository = patientRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllPatients() {
        try {
            List<UserDto> patients = userService.getAllPatients();
            return ResponseEntity.ok(patients);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Long id) {
        try {
            PatientResponse patient = userService.getPatientById(id);
            return ResponseEntity.ok(patient);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getPatient(HttpServletRequest request) {
        try {
            Map<String, Object> response = new HashMap<>();
            Optional<User> optionalUser = userService.getUserById((Long) request.getAttribute("userId"));
            if (optionalUser.isEmpty()) {
                response.put("success", false);
                response.put("message", "Patient not found");
                return ResponseEntity.badRequest().body(response);
            }


            User user = optionalUser.get();
            System.out.println("Printing"+user.getId());
            Patient patient = patientRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Patient profile not found for user"));
            System.out.println("In the  patient profile  api");
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("name", user.getName());
            profileData.put("email", user.getEmail());
            profileData.put("phone", user.getPhone());
            profileData.put("role", user.getRole().toString());
            profileData.put("birthDate", user.getBirthDate());
            profileData.put("gender", user.getGender().toString());
            profileData.put("profileImage", user.getProfileImage());
            profileData.put("heightCm", patient.getHeightCm());
            profileData.put("weightKg", patient.getWeightKg());
            profileData.put("bloodType", patient.getBloodType());
            profileData.put("createdAt", patient.getCreatedAt());
            profileData.put("updatedAt", patient.getUpdatedAt());
            System.out.println(profileData);
            return ResponseEntity.ok(profileData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
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