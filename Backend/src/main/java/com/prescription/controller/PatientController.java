package com.prescription.controller;

import com.prescription.dto.PatientResponse;
import com.prescription.dto.UserDto;
import com.prescription.entity.User;
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

    @Autowired
    private UserService userService;

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
//            Long id = optionalUser.get().getId();
//            PatientResponse patient = userService.getPatientById(id);
//            return ResponseEntity.ok(patient);
            return ResponseEntity.ok(optionalUser.get());
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