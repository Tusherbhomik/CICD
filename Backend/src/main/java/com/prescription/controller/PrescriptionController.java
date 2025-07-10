package com.prescription.controller;

import com.prescription.dto.PrescriptionCreateDto;
import com.prescription.dto.PrescriptionDto;
import com.prescription.service.PrescriptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/prescriptions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @PostMapping
   @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createPrescription(@Valid @RequestBody PrescriptionCreateDto createDto,
                                                HttpServletRequest request) {
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Doctor ID not found in request"));
            }
            System.out.println(createDto.getAdvice());
            PrescriptionDto prescription = prescriptionService.createPrescription(createDto, doctorId);
            return ResponseEntity.ok(prescription);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PrescriptionDto>> getDoctorPrescriptions(HttpServletRequest request) {
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                return ResponseEntity.badRequest().build();
            }

            List<PrescriptionDto> prescriptions = prescriptionService.getPrescriptionsByDoctor(doctorId);
            return ResponseEntity.ok(prescriptions);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PrescriptionDto>> getPatientPrescriptions(HttpServletRequest request) {
        try {
            Long patientId = (Long) request.getAttribute("userId");
            if (patientId == null) {
                return ResponseEntity.badRequest().build();
            }

            List<PrescriptionDto> prescriptions = prescriptionService.getPrescriptionsByPatient(patientId);
            System.out.println(prescriptions);
            return ResponseEntity.ok(prescriptions);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }




    @GetMapping("/patient/{patientId}")
   @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PrescriptionDto>> getPatientPrescriptions(@PathVariable Long patientId) {
        try {
            List<PrescriptionDto> prescriptions = prescriptionService.getPrescriptionsByPatient(patientId);
            return ResponseEntity.ok(prescriptions);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<PrescriptionDto> getPrescriptionById(@PathVariable Long id,
                                                               HttpServletRequest request) {
        try {
            Optional<PrescriptionDto> prescriptionOpt = prescriptionService.getPrescriptionById(id);
            if (prescriptionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PrescriptionDto prescription = prescriptionOpt.get();

            // Check if user has permission to view this prescription
            Long userId = (Long) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            if ("DOCTOR".equals(userRole) && !prescription.getDoctor().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            } else if ("PATIENT".equals(userRole) && !prescription.getPatient().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(prescription);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
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