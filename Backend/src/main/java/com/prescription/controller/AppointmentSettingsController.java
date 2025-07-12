// AppointmentSettingsController.java
package com.prescription.controller;

import com.prescription.entity.AppointmentSettings;
import com.prescription.service.AppointmentSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/appointment-settings")
@RequiredArgsConstructor
public class AppointmentSettingsController {

    private final AppointmentSettingsService appointmentSettingsService;

    /**
     * Get appointment settings for a specific doctor
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<AppointmentSettings> getSettingsByDoctorId(@PathVariable Long doctorId) {
        Optional<AppointmentSettings> settings = appointmentSettingsService.getSettingsByDoctorId(doctorId);

        if (settings.isPresent()) {
            return ResponseEntity.ok(settings.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get appointment settings for a doctor or create default settings if none exist
     */
    @GetMapping("/doctor/{doctorId}/or-create")
    public ResponseEntity<AppointmentSettings> getOrCreateSettingsForDoctor(@PathVariable Long doctorId) {
        AppointmentSettings settings = appointmentSettingsService.getOrCreateSettingsForDoctor(doctorId);
        return ResponseEntity.ok(settings);
    }

    /**
     * Create new appointment settings for a doctor
     */
    @PostMapping
    public ResponseEntity<AppointmentSettings> createSettings(@Valid @RequestBody AppointmentSettings settings) {
        try {
            AppointmentSettings savedSettings = appointmentSettingsService.saveSettings(settings);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSettings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * Update appointment settings for a doctor
     */
    @PutMapping("/doctor/{doctorId}")
    public ResponseEntity<AppointmentSettings> updateSettings(
            @PathVariable Long doctorId,
            @Valid @RequestBody AppointmentSettings updatedSettings) {
        try {
            AppointmentSettings settings = appointmentSettingsService.updateSettings(doctorId, updatedSettings);
            return ResponseEntity.ok(settings);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete appointment settings for a doctor
     */
    @DeleteMapping("/doctor/{doctorId}")
    public ResponseEntity<Void> deleteSettings(@PathVariable Long doctorId) {
        if (appointmentSettingsService.existsForDoctor(doctorId)) {
            appointmentSettingsService.deleteSettings(doctorId);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Check if appointment settings exist for a doctor
     */
    @GetMapping("/doctor/{doctorId}/exists")
    public ResponseEntity<Boolean> checkIfSettingsExist(@PathVariable Long doctorId) {
        boolean exists = appointmentSettingsService.existsForDoctor(doctorId);
        return ResponseEntity.ok(exists);
    }
}