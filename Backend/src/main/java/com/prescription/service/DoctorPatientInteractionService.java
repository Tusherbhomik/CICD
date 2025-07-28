package com.prescription.service;

import com.prescription.repository.AppointmentRepository;
import com.prescription.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class DoctorPatientInteractionService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    public long getUniquePatientCount(Long doctorId) {
        // Get patient IDs from appointments
        Set<Long> appointmentPatientIds = appointmentRepository.findPatientIdsByDoctorId(doctorId);

        // Get patient IDs from prescriptions
        Set<Long> prescriptionPatientIds = prescriptionRepository.findPatientIdsByDoctorId(doctorId);

        // Combine and count unique patient IDs
        Set<Long> uniquePatientIds = new HashSet<>();
        uniquePatientIds.addAll(appointmentPatientIds);
        uniquePatientIds.addAll(prescriptionPatientIds);

        return uniquePatientIds.size();
    }
}