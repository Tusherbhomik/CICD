// AppointmentSettingsService.java
package com.prescription.service;

import com.prescription.entity.AppointmentSettings;
import com.prescription.entity.User;
import com.prescription.repository.AppointmentSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentSettingsService {

    private final AppointmentSettingsRepository appointmentSettingsRepository;

    /**
     * Get appointment settings for a specific doctor
     */
    public Optional<AppointmentSettings> getSettingsByDoctorId(Long doctorId) {
        return appointmentSettingsRepository.findByDoctorId(doctorId);
    }

    /**
     * Get appointment settings for a specific doctor or create default settings if none exist
     */
    @Transactional
    public AppointmentSettings getOrCreateSettingsForDoctor(Long doctorId) {
        return appointmentSettingsRepository.findByDoctorId(doctorId)
                .orElseGet(() -> createDefaultSettings(doctorId));
    }

    /**
     * Create or update appointment settings for a doctor
     */
    @Transactional
    public AppointmentSettings saveSettings(AppointmentSettings settings) {
        return appointmentSettingsRepository.save(settings);
    }

    /**
     * Update existing appointment settings
     */
    @Transactional
    public AppointmentSettings updateSettings(Long doctorId, AppointmentSettings updatedSettings) {
        AppointmentSettings existingSettings = appointmentSettingsRepository.findByDoctorId(doctorId)
                .orElseThrow(() -> new RuntimeException("Appointment settings not found for doctor ID: " + doctorId));

        // Update fields
        existingSettings.setAutoApprove(updatedSettings.isAutoApprove());
        existingSettings.setAllowOverbooking(updatedSettings.isAllowOverbooking());
        existingSettings.setSlotDurationMinutes(updatedSettings.getSlotDurationMinutes());
        existingSettings.setAdvanceBookingDays(updatedSettings.getAdvanceBookingDays());
        existingSettings.setBufferTimeMinutes(updatedSettings.getBufferTimeMinutes());

        return appointmentSettingsRepository.save(existingSettings);
    }

    /**
     * Delete appointment settings for a doctor
     */
    @Transactional
    public void deleteSettings(Long doctorId) {
        appointmentSettingsRepository.deleteByDoctorId(doctorId);
    }

    /**
     * Check if appointment settings exist for a doctor
     */
    public boolean existsForDoctor(Long doctorId) {
        return appointmentSettingsRepository.existsByDoctorId(doctorId);
    }

    /**
     * Create default appointment settings for a doctor
     */
    private AppointmentSettings createDefaultSettings(Long doctorId) {
        AppointmentSettings defaultSettings = new AppointmentSettings();

        // Create a User object with the doctor ID (you might need to fetch the full User entity)
        User doctor = new User();
        doctor.setId(doctorId);
        defaultSettings.setDoctor(doctor);

        // Set default values
        defaultSettings.setAutoApprove(false);
        defaultSettings.setAllowOverbooking(false);
        defaultSettings.setSlotDurationMinutes(30);
        defaultSettings.setAdvanceBookingDays(30);
        defaultSettings.setBufferTimeMinutes(5);

        return appointmentSettingsRepository.save(defaultSettings);
    }
}