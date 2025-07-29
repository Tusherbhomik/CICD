package com.prescription.service;

import com.prescription.entity.Appointment;
import com.prescription.entity.Hospital;
import com.prescription.entity.User;
import com.prescription.repository.AppointmentRepository;
import com.prescription.repository.HospitalRepository;
import com.prescription.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.prescription.service.NotificationService;
import com.prescription.entity.Notification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@Transactional
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private HospitalRepository hospitalRepository;

    // Existing methods from previous implementation...

    // Additional methods for the controller

    public List<Appointment> getAllPatientAppointments(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        return appointmentRepository.findByPatientOrderByCreatedAtDesc(patient);
    }

    public List<Appointment> getPatientAppointmentsByStatus(Long patientId, Appointment.Status status) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        return appointmentRepository.findByPatientAndStatus(patient, status);
    }

    public List<Appointment> getAllDoctorAppointments(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        return appointmentRepository.findByDoctorOrderByCreatedAtDesc(doctor);
    }

    public List<Appointment> getDoctorAppointmentsByStatus(Long doctorId, Appointment.Status status) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        return appointmentRepository.findByDoctorAndStatus(doctor, status);
    }

    public boolean cancelAppointmentByPatient(Long appointmentId, Long patientId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            if (appointment.getPatient().getId().equals(patientId) &&
                    (appointment.getStatus() == Appointment.Status.REQUESTED ||
                            appointment.getStatus() == Appointment.Status.SCHEDULED)) {
                appointment.setStatus(Appointment.Status.CANCELLED);
                appointmentRepository.save(appointment);

                // Send cancellation notifications
                try {
                    String cancellationMessage = String.format("Appointment scheduled for %s has been cancelled by the patient.",
                            appointment.getScheduledTime() != null ? appointment.getScheduledTime().toString() : "TBD");

                    // Notify doctor about cancellation
                    notificationService.sendAppointmentNotification(
                            appointment.getDoctor().getId(),
                            appointmentId,
                            Notification.NotificationType.APPOINTMENT_CANCELLATION,
                            cancellationMessage
                    );

                    // Notify patient about cancellation confirmation
                    notificationService.sendAppointmentNotification(
                            patientId,
                            appointmentId,
                            Notification.NotificationType.APPOINTMENT_CANCELLATION,
                            "Your appointment has been successfully cancelled."
                    );
                } catch (Exception e) {
                    System.err.println("Failed to send cancellation notifications: " + e.getMessage());
                }

                return true;
            }
        }
        return false;
    }

    public boolean rejectAppointment(Long appointmentId, Long doctorId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            if (appointment.getDoctor().getId().equals(doctorId) &&
                    appointment.getStatus() == Appointment.Status.REQUESTED) {
                appointment.setStatus(Appointment.Status.CANCELLED);
                appointmentRepository.save(appointment);

                // Send rejection notification to patient
                try {
                    String rejectionMessage = String.format("Your appointment request for %s has been declined by Dr. %s. Please contact the clinic for alternative options.",
                            appointment.getFollowupDate() != null ? appointment.getFollowupDate().toString() : "the requested time",
                            appointment.getDoctor().getName());
                    notificationService.sendAppointmentNotification(
                            appointment.getPatient().getId(),
                            appointmentId,
                            Notification.NotificationType.APPOINTMENT_CANCELLATION,
                            rejectionMessage
                    );
                } catch (Exception e) {
                    System.err.println("Failed to send rejection notification: " + e.getMessage());
                }

                return true;
            }
        }
        return false;
    }

    public boolean completeAppointment(Long appointmentId, Long doctorId, String notes) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            if (appointment.getDoctor().getId().equals(doctorId) &&
                    (appointment.getStatus() == Appointment.Status.SCHEDULED ||
                            appointment.getStatus() == Appointment.Status.CONFIRMED)) {
                appointment.setStatus(Appointment.Status.COMPLETED);
                if (notes != null && !notes.trim().isEmpty()) {
                    appointment.setNotes(notes);
                }
                appointmentRepository.save(appointment);
                return true;
            }
        }
        return false;
    }

    public Map<String, Object> getAppointmentStatistics(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        Map<String, Object> stats = new HashMap<>();

        // Get all appointments for the doctor
        List<Appointment> allAppointments = appointmentRepository.findByDoctor(doctor);

        // Calculate statistics
        long totalAppointments = allAppointments.size();
        long pendingRequests = allAppointments.stream()
                .filter(apt -> apt.getStatus() == Appointment.Status.REQUESTED)
                .count();
        long scheduledAppointments = allAppointments.stream()
                .filter(apt -> apt.getStatus() == Appointment.Status.SCHEDULED ||
                        apt.getStatus() == Appointment.Status.CONFIRMED)
                .count();
        long completedAppointments = allAppointments.stream()
                .filter(apt -> apt.getStatus() == Appointment.Status.COMPLETED)
                .count();
        long cancelledAppointments = allAppointments.stream()
                .filter(apt -> apt.getStatus() == Appointment.Status.CANCELLED)
                .count();

        // Today's appointments
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        long todaysAppointments = allAppointments.stream()
                .filter(apt -> apt.getScheduledTime() != null &&
                        apt.getScheduledTime().isAfter(startOfDay) &&
                        apt.getScheduledTime().isBefore(endOfDay))
                .count();

        // This week's appointments
        LocalDateTime startOfWeek = today.atStartOfDay().minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDateTime endOfWeek = startOfWeek.plusDays(6).withHour(23).withMinute(59).withSecond(59);

        long thisWeekAppointments = allAppointments.stream()
                .filter(apt -> apt.getScheduledTime() != null &&
                        apt.getScheduledTime().isAfter(startOfWeek) &&
                        apt.getScheduledTime().isBefore(endOfWeek))
                .count();

        // New patients (first-time appointments)
        Set<Long> uniquePatients = new HashSet<>();
        long newPatients = 0;
        for (Appointment apt : allAppointments) {
            if (apt.getPatient() != null) {
                Long patientId = apt.getPatient().getId();
                if (!uniquePatients.contains(patientId)) {
                    uniquePatients.add(patientId);
                    if (apt.getStatus() == Appointment.Status.REQUESTED ||
                            apt.getStatus() == Appointment.Status.SCHEDULED) {
                        newPatients++;
                    }
                }
            }
        }

        // Populate stats map
        stats.put("totalAppointments", totalAppointments);
        stats.put("pendingRequests", pendingRequests);
        stats.put("scheduledAppointments", scheduledAppointments);
        stats.put("completedAppointments", completedAppointments);
        stats.put("cancelledAppointments", cancelledAppointments);
        stats.put("todaysAppointments", todaysAppointments);
        stats.put("thisWeekAppointments", thisWeekAppointments);
        stats.put("newPatients", newPatients);
        stats.put("totalUniquePatients", uniquePatients.size());

        return stats;
    }

    public boolean updateAppointmentNotes(Long appointmentId, String notes) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setNotes(notes);
            appointmentRepository.save(appointment);
            return true;
        }
        return false;
    }

    public Appointment findById(Long appointmentId) {
        return appointmentRepository.findById(appointmentId).orElse(null);
    }

    // Patient requests appointment (existing method enhanced)
    public Appointment requestAppointment(Long doctorId, Long patientId, LocalDate appointmentDate,
                                    LocalTime appointmentTime, Appointment.Type type, String reason,Long hospitalId,String dateandtime) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));


        Hospital hospital=hospitalRepository.getById(hospitalId);
        Appointment appointment = new Appointment(LocalDateTime.of(appointmentDate, appointmentTime), type, doctor, patient,hospital,dateandtime);
        appointment.setNotes(reason);
        appointment.setFollowupDate(LocalDateTime.of(appointmentDate, appointmentTime));
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send notifications after successful booking
        try {
            // Notify the patient about appointment request
            String patientMessage = String.format("Your appointment request with Dr. %s for %s at %s has been submitted and is pending confirmation.",
                    doctor.getName(), appointmentDate.toString(), appointmentTime.toString());
            notificationService.sendAppointmentNotification(
                    patientId,
                    savedAppointment.getId(),
                    Notification.NotificationType.APPOINTMENT_CONFIRMATION,
                    patientMessage
            );

            // Notify the doctor about new appointment request
            String doctorMessage = String.format("New appointment request from %s for %s at %s. Please review and confirm.",
                    patient.getName(), appointmentDate.toString(), appointmentTime.toString());
            notificationService.sendAppointmentNotification(
                    doctorId,
                    savedAppointment.getId(),
                    Notification.NotificationType.APPOINTMENT_CONFIRMATION,
                    doctorMessage
            );
        } catch (Exception e) {
            System.err.println("Failed to send appointment booking notifications: " + e.getMessage());
        }

        return savedAppointment;
    }

    // Doctor gets pending requests (existing method)
    public List<Appointment> getPendingRequests(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        return appointmentRepository.findByDoctorAndStatusOrderByCreatedAtDesc(doctor, Appointment.Status.REQUESTED);
    }

    // Doctor schedules appointment (existing method enhanced)
    public Appointment scheduleAppointment(Long appointmentId, LocalDateTime scheduledTime,
                                     Appointment.Type type, String location, String notes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        // Validate that the appointment is in the correct status
        if (appointment.getStatus() != Appointment.Status.REQUESTED) {
            throw new IllegalStateException("Appointment is not in pending status");
        }

        // Check for scheduling conflicts
        List<Appointment> conflictingAppointments = appointmentRepository
                .findByDoctorAndScheduledTimeBetween(
                        appointment.getDoctor(),
                        scheduledTime.minusMinutes(30),
                        scheduledTime.plusMinutes(30)
                );

        if (!conflictingAppointments.isEmpty()) {
            throw new IllegalStateException("Doctor has a conflicting appointment at this time");
        }

        appointment.setScheduledTime(scheduledTime);
        appointment.setType(type);

        appointment.setNotes(notes);
        appointment.setStatus(Appointment.Status.SCHEDULED);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send confirmation notification to patient
        try {
            String confirmationMessage = String.format("Your appointment has been confirmed for %s. Location: %s. Notes: %s",
                    scheduledTime.toString(), location != null ? location : "TBD", notes != null ? notes : "None");
            notificationService.sendAppointmentNotification(
                    appointment.getPatient().getId(),
                    appointmentId,
                    Notification.NotificationType.APPOINTMENT_CONFIRMATION,
                    confirmationMessage
            );
        } catch (Exception e) {
            System.err.println("Failed to send appointment confirmation notification: " + e.getMessage());
        }

        return savedAppointment;
    }

    // Get confirmed appointments (existing method)
    public List<Appointment> getConfirmedAppointments(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        List<Appointment.Status> confirmedStatuses = Arrays.asList(
                Appointment.Status.SCHEDULED,
                Appointment.Status.CONFIRMED
        );
        return appointmentRepository.findByDoctorAndStatusInOrderByScheduledTimeAsc(doctor, confirmedStatuses);
    }

    // Get appointments for a specific date (existing method)
    public List<Appointment> getAppointmentsByDate(Long doctorId, LocalDate date) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        return appointmentRepository.findByDoctorAndScheduledTimeBetweenOrderByScheduledTimeAsc(
                doctor, startOfDay, endOfDay);
    }
}
