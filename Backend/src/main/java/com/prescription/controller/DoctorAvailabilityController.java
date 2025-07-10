// ============= CONTROLLER CLASS (COMPLETE) =============

package com.prescription.controller;

import com.prescription.dto.*;
import com.prescription.entity.*;
import com.prescription.service.DoctorAvailabilityService;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/doctor-availability")
@CrossOrigin(origins = "*")
public class DoctorAvailabilityController {

    @Autowired
    private DoctorAvailabilityService availabilityService;

    @Autowired
    private UserService userService;

    // ============= TEMPLATE MANAGEMENT =============

    @PostMapping("/templates")
    public ResponseEntity<Map<String, Object>> createTemplate(
            @Valid @RequestBody AvailabilityTemplateDTO templateDTO,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            System.out.println(0);
            AvailabilityTemplate template = availabilityService.createTemplate(doctorId, templateDTO);
            System.out.println(1);

            response.put("success", true);
            response.put("message", "Template created successfully");
            response.put("template", availabilityService.convertToTemplateDTO(template));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error creating template: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/templates")
    public ResponseEntity<List<AvailabilityTemplateDTO>> getTemplates(HttpServletRequest request) {
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<AvailabilityTemplate> templates = availabilityService.getDoctorTemplates(doctorId);
            List<AvailabilityTemplateDTO> templateDTOs = templates.stream()
                    .map(availabilityService::convertToTemplateDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(templateDTOs);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/templates/{templateId}")
    public ResponseEntity<Map<String, Object>> updateTemplate(
            @PathVariable Long templateId,
            @Valid @RequestBody AvailabilityTemplateDTO templateDTO,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            AvailabilityTemplate template = availabilityService.updateTemplate(templateId, templateDTO);

            response.put("success", true);
            response.put("message", "Template updated successfully");
            response.put("template", availabilityService.convertToTemplateDTO(template));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating template: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/templates/{templateId}")
    public ResponseEntity<Map<String, Object>> deleteTemplate(
            @PathVariable Long templateId,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            availabilityService.deleteTemplate(templateId);

            response.put("success", true);
            response.put("message", "Template deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting template: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= EXCEPTION MANAGEMENT =============

    @PostMapping("/exceptions")
    public ResponseEntity<Map<String, Object>> createException(
            @Valid @RequestBody AvailabilityExceptionDTO exceptionDTO,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            AvailabilityException exception = availabilityService.createException(doctorId, exceptionDTO);

            response.put("success", true);
            response.put("message", "Exception created successfully");
            response.put("exception", availabilityService.convertToExceptionDTO(exception));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error creating exception: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/exceptions")
    public ResponseEntity<List<AvailabilityExceptionDTO>> getExceptions(HttpServletRequest request) {
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<AvailabilityException> exceptions = availabilityService.getDoctorExceptions(doctorId);
            List<AvailabilityExceptionDTO> exceptionDTOs = exceptions.stream()
                    .map(availabilityService::convertToExceptionDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(exceptionDTOs);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/exceptions/{exceptionId}")
    public ResponseEntity<Map<String, Object>> updateException(
            @PathVariable Long exceptionId,
            @Valid @RequestBody AvailabilityExceptionDTO exceptionDTO,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            AvailabilityException exception = availabilityService.updateException(exceptionId, exceptionDTO);

            response.put("success", true);
            response.put("message", "Exception updated successfully");
            response.put("exception", availabilityService.convertToExceptionDTO(exception));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating exception: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/exceptions/{exceptionId}")
    public ResponseEntity<Map<String, Object>> deleteException(
            @PathVariable Long exceptionId,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            availabilityService.deleteException(exceptionId);

            response.put("success", true);
            response.put("message", "Exception deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting exception: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= SLOT MANAGEMENT =============

    @GetMapping("/slots")
    public ResponseEntity<List<DoctorAvailabilitySlotDTO>> getSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<DoctorAvailabilitySlot> slots = availabilityService.getDoctorAvailableSlots(doctorId, startDate, endDate);
            List<DoctorAvailabilitySlotDTO> slotDTOs = slots.stream()
                    .map(availabilityService::convertToSlotDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(slotDTOs);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/slots/{date}")
    public ResponseEntity<List<DoctorAvailabilitySlotDTO>> getSlotsForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request) {
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<DoctorAvailabilitySlot> slots = availabilityService.getDoctorSlotsForDate(doctorId, date);
            List<DoctorAvailabilitySlotDTO> slotDTOs = slots.stream()
                    .map(availabilityService::convertToSlotDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(slotDTOs);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/slots/{slotId}/book")
    public ResponseEntity<Map<String, Object>> bookSlot(
            @PathVariable Long slotId,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            DoctorAvailabilitySlot slot = availabilityService.bookSlot(slotId);

            response.put("success", true);
            response.put("message", "Slot booked successfully");
            response.put("slot", availabilityService.convertToSlotDTO(slot));
            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error booking slot: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/slots/{slotId}/release")
    public ResponseEntity<Map<String, Object>> releaseSlot(
            @PathVariable Long slotId,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            DoctorAvailabilitySlot slot = availabilityService.releaseSlot(slotId);

            response.put("success", true);
            response.put("message", "Slot released successfully");
            response.put("slot", availabilityService.convertToSlotDTO(slot));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error releasing slot: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= SETTINGS MANAGEMENT =============

    @GetMapping("/settings")
    public ResponseEntity<AppointmentSettingsDTO> getSettings(HttpServletRequest request) {
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            AppointmentSettings settings = availabilityService.getOrCreateSettings(doctorId);
            AppointmentSettingsDTO settingsDTO = availabilityService.convertToSettingsDTO(settings);

            return ResponseEntity.ok(settingsDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(
            @Valid @RequestBody AppointmentSettingsDTO settingsDTO,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            AppointmentSettings settings = availabilityService.updateSettings(doctorId, settingsDTO);

            response.put("success", true);
            response.put("message", "Settings updated successfully");
            response.put("settings", availabilityService.convertToSettingsDTO(settings));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= BULK OPERATIONS =============

    @PostMapping("/regenerate-slots")
    public ResponseEntity<Map<String, Object>> regenerateAllSlots(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = (Long) request.getAttribute("userId");
            if (doctorId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            availabilityService.regenerateAllSlots(doctorId);

            response.put("success", true);
            response.put("message", "All slots regenerated successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error regenerating slots: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= PUBLIC ENDPOINTS FOR PATIENTS =============

    // Add this method to your controller for simpler frontend calls
    @GetMapping("/public/doctor/{doctorId}/slots")
    public ResponseEntity<List<DoctorAvailabilitySlotDTO>> getPublicDoctorSlots(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            // Set default dates if not provided
            if (startDate == null) {
                startDate = LocalDate.now();
            }
            if (endDate == null) {
                endDate = LocalDate.now().plusDays(30); // 30 days from now
            }

            List<DoctorAvailabilitySlot> slots = availabilityService.getDoctorAvailableSlots(doctorId, startDate, endDate);
            // Filter only available slots for public access
            List<DoctorAvailabilitySlotDTO> availableSlots = slots.stream()
                    .filter(slot -> slot.getSlotStatus() == DoctorAvailabilitySlot.SlotStatus.AVAILABLE)
                    .map(availabilityService::convertToSlotDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(availableSlots);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/public/doctor/{doctorId}/slots/{date}")
    public ResponseEntity<List<DoctorAvailabilitySlotDTO>> getPublicDoctorSlotsForDate(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<DoctorAvailabilitySlot> slots = availabilityService.getDoctorSlotsForDate(doctorId, date);
            // Filter only available slots for public access
            List<DoctorAvailabilitySlotDTO> availableSlots = slots.stream()
                    .filter(slot -> slot.getSlotStatus() == DoctorAvailabilitySlot.SlotStatus.AVAILABLE)
                    .map(availabilityService::convertToSlotDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(availableSlots);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}