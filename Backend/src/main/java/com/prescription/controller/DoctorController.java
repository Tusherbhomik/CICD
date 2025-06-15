package com.prescription.controller;

import com.prescription.dto.DoctorResponse;
import com.prescription.dto.PatientResponse;
import com.prescription.dto.UserDto;
import com.prescription.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorController {

    @Autowired
    private UserService userService;

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