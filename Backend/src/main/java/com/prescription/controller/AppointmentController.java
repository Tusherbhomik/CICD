package com.prescription.controller;

import com.prescription.dto.AppointmentRequestDTO;
import com.prescription.dto.AppointmentResponseDTO;
import com.prescription.dto.AppointmentScheduleDTO;
import com.prescription.dto.DoctorSearchDTO;
import com.prescription.entity.Appointment;
import com.prescription.entity.User;
import com.prescription.repository.AppointmentRepository;
import com.prescription.service.AppointmentService;
import com.prescription.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ============= PATIENT ENDPOINTS =============




    /**
     * Patient requests appointment with a specific doctor
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> requestAppointment(@Valid @RequestBody AppointmentRequestDTO request, HttpServletRequest request2) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println(request);
            // Validate patient and doctor exist
            Optional<User> patient = userService.getUserById((Long) request2.getAttribute("userId"));
            Optional<User> doctor = userService.getUserById(request.getDoctorId());

            if (patient.isEmpty()) {
                response.put("success", false);
                response.put("message", "Patient not found");
                return ResponseEntity.badRequest().body(response);
            }

            if (doctor.isEmpty()) {
                response.put("success", false);
                response.put("message", "Doctor not found");
                return ResponseEntity.badRequest().body(response);
            }



            Appointment appointment = appointmentService.requestAppointment(
                    request.getDoctorId(),
                    (Long) request2.getAttribute("userId"),

                    request.getAppointmentDate(),
                    request.getAppointmentTime(),
                    request.getType(),


                    request.getReason()

            );

            response.put("success", true);
            response.put("message", "Appointment request sent successfully");
            response.put("appointment", convertToResponseDTO(appointment));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to request appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Patient gets their appointment history
     */
    @GetMapping("/patient")
    public ResponseEntity<List<AppointmentResponseDTO>> getPatientAppointments(
            HttpServletRequest request) {
        try {
            List<Appointment> appointments;
//            if (status != null && !status.isEmpty()) {
//                Appointment.Status appointmentStatus = Appointment.Status.valueOf(status.toUpperCase());
//                appointments = appointmentService.getPatientAppointmentsByStatus(patientId, appointmentStatus);
//            } else {
//                appointments = appointmentService.getAllPatientAppointments(patientId);
//            }
            Optional<User> optionalUser = userService.getUserById((Long) request.getAttribute("userId"));
            appointments=appointmentRepository.findByPatient(optionalUser.get());
            List<AppointmentResponseDTO> appointmentDTOs = appointments.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(appointmentDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Patient cancels their appointment
     */
    @PostMapping("/{appointmentId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelAppointment(
            @PathVariable Long appointmentId,
            @RequestParam Long patientId) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean cancelled = appointmentService.cancelAppointmentByPatient(appointmentId, patientId);
            if (cancelled) {
                response.put("success", true);
                response.put("message", "Appointment cancelled successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Unable to cancel appointment");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error cancelling appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= DOCTOR ENDPOINTS =============

    /**
     * Doctor gets pending appointment requests
     */
    @GetMapping("/doctor/pending")
    public ResponseEntity<List<AppointmentResponseDTO>> getPendingRequests(HttpServletRequest request2) {
        try {
            Long doctorId = (Long) request2.getAttribute("userId");
            if (doctorId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<Appointment> requests = appointmentService.getPendingRequests(doctorId);
            List<AppointmentResponseDTO> requestDTOs = requests.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(requestDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Doctor schedules an appointment (confirms request with time/place)
     */
    @PostMapping("/{appointmentId}/schedule")
    public ResponseEntity<Map<String, Object>> scheduleAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentScheduleDTO scheduleData) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Validate the appointment belongs to the doctor
            Appointment existingAppointment = appointmentService.findById(appointmentId);
            if (existingAppointment == null) {
                response.put("success", false);
                response.put("message", "Appointment not found");
                return ResponseEntity.badRequest().body(response);
            }

            if (!existingAppointment.getStatus().equals(Appointment.Status.REQUESTED)) {
                response.put("success", false);
                response.put("message", "Appointment is not in pending status");
                return ResponseEntity.badRequest().body(response);
            }

            Appointment appointment = appointmentService.scheduleAppointment(
                    appointmentId,
                    scheduleData.getScheduledTime(),
                    scheduleData.getType(),
                    scheduleData.getLocation(),
                    scheduleData.getNotes()
            );

            response.put("success", true);
            response.put("message", "Appointment scheduled successfully");
            response.put("appointment", convertToResponseDTO(appointment));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error scheduling appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Doctor rejects appointment request
     */
    @PostMapping("/{appointmentId}/reject")
    public ResponseEntity<Map<String, Object>> rejectAppointment(
            @PathVariable Long appointmentId,
            @RequestParam Long doctorId) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean rejected = appointmentService.rejectAppointment(appointmentId, doctorId);
            if (rejected) {
                response.put("success", true);
                response.put("message", "Appointment request rejected");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Unable to reject appointment");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error rejecting appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Doctor gets confirmed appointments
     */
    @GetMapping("/doctor/confirmed")
    public ResponseEntity<List<AppointmentResponseDTO>> getConfirmedAppointments(HttpServletRequest request) {
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            List<Appointment> appointments = appointmentService.getConfirmedAppointments(doctorId);
            List<AppointmentResponseDTO> appointmentDTOs = appointments.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(appointmentDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Doctor gets all appointments (any status)
     */
    @GetMapping("/doctor/all")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllDoctorAppointments(
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        try {
            Optional<User> optionalUser = userService.getUserById((Long) request.getAttribute("userId"));
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            User currentUser = optionalUser.get();
            Long doctorId = currentUser.getId();
            List<Appointment> appointments;
            if (status != null && !status.isEmpty()) {
                Appointment.Status appointmentStatus = Appointment.Status.valueOf(status.toUpperCase());
                appointments = appointmentService.getDoctorAppointmentsByStatus(doctorId, appointmentStatus);
            } else {
                appointments = appointmentService.getAllDoctorAppointments(doctorId);
            }

            List<AppointmentResponseDTO> appointmentDTOs = appointments.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(appointmentDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Doctor gets appointments by specific date
     */
    @GetMapping("/doctor/{doctorId}/date/{date}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByDate(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsByDate(doctorId, date);
            List<AppointmentResponseDTO> appointmentDTOs = appointments.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(appointmentDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Doctor marks appointment as completed
     */
    @PostMapping("/{appointmentId}/complete")
    public ResponseEntity<Map<String, Object>> completeAppointment(
            @PathVariable Long appointmentId,
            @RequestParam Long doctorId,
            @RequestParam(required = false) String notes) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean completed = appointmentService.completeAppointment(appointmentId, doctorId, notes);
            if (completed) {
                response.put("success", true);
                response.put("message", "Appointment marked as completed");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Unable to complete appointment");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error completing appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= GENERAL ENDPOINTS =============

    /**
     * Get appointment details by ID
     */
    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponseDTO> getAppointmentDetails(@PathVariable Long appointmentId) {
        try {
            Appointment appointment = appointmentService.findById(appointmentId);
            if (appointment == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(convertToResponseDTO(appointment));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get appointment statistics for dashboard
     */
    @GetMapping("/doctor/{doctorId}/stats")
    public ResponseEntity<Map<String, Object>> getAppointmentStats(@PathVariable Long doctorId) {
        try {
            Map<String, Object> stats = appointmentService.getAppointmentStatistics(doctorId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update appointment notes
     */
    @PutMapping("/{appointmentId}/notes")
    public ResponseEntity<Map<String, Object>> updateAppointmentNotes(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String notes = request.get("notes");
            boolean updated = appointmentService.updateAppointmentNotes(appointmentId, notes);
            if (updated) {
                response.put("success", true);
                response.put("message", "Notes updated successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Unable to update notes");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating notes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= UTILITY METHODS =============

    /**
     * Convert Appointment entity to Response DTO
     */
    private AppointmentResponseDTO convertToResponseDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        dto.setScheduledTime(appointment.getScheduledTime());
        dto.setStatus(appointment.getStatus().toString());
        dto.setType(appointment.getType() != null ? appointment.getType().toString() : null);
        dto.setNotes(appointment.getNotes());


        dto.setFollowupDate(appointment.getFollowupDate());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());

        // Set doctor information
        if (appointment.getDoctor() != null) {
            Map<String, Object> doctorInfo = new HashMap<>();
            doctorInfo.put("id", appointment.getDoctor().getId());
            doctorInfo.put("name", appointment.getDoctor().getName());
            doctorInfo.put("email", appointment.getDoctor().getEmail());

            dto.setDoctor(doctorInfo);
        }

        // Set patient information
        if (appointment.getPatient() != null) {
            Map<String, Object> patientInfo = new HashMap<>();
            patientInfo.put("id", appointment.getPatient().getId());
            patientInfo.put("name", appointment.getPatient().getName());
            patientInfo.put("email", appointment.getPatient().getEmail());

            patientInfo.put("phone", appointment.getPatient().getPhone());
            dto.setPatient(patientInfo);
        }

        return dto;
    }

    /**
     * Convert User (Doctor) entity to Search DTO
     */
    private DoctorSearchDTO convertToDoctorSearchDTO(User doctor) {
        DoctorSearchDTO dto = new DoctorSearchDTO();
        dto.setId(doctor.getId());
        dto.setName(doctor.getName());
        dto.setEmail(doctor.getEmail());

        dto.setPhone(doctor.getPhone());

        return dto;
    }

    // ============= ERROR HANDLING =============

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Invalid request: " + e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Server error: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
