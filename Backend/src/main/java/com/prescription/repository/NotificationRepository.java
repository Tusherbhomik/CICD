package com.prescription.repository;

import com.prescription.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
    List<Notification> findByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);
    List<Notification> findByPrescriptionIdOrderByCreatedAtDesc(Long prescriptionId);
    List<Notification> findByPrescriptionIdAndReminderTimeAndType(Long prescriptionId, LocalTime reminderTime, Notification.NotificationType type);
}