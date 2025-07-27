package com.prescription.service;

import com.prescription.entity.Notification;
import com.prescription.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void sendNotification(Long userId, String title, String message, Notification.NotificationType type,
                                 Long appointmentId, Long prescriptionId, LocalTime reminderTime, String frequency) {
        try {
            System.out.println("🔍 Starting notification save process for user: " + userId);

            Notification notification = Notification.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .appointmentId(appointmentId)
                    .prescriptionId(prescriptionId)
                    .reminderTime(reminderTime)
                    .frequency(frequency)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build();

            System.out.println("🔍 Notification object created: " + notification);

            Notification saved = notificationRepository.save(notification);
            notificationRepository.flush();
            System.out.println("✅ Notification saved successfully with ID: " + saved.getId());

            List<Notification> allUserNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            boolean found = allUserNotifications.stream().anyMatch(n -> n.getId().equals(saved.getId()));
            System.out.println("✅ Notification exists in database: " + found);

            if (!found) {
                System.err.println("❌ FAILED: Notification was NOT found in database after save!");
                throw new RuntimeException("Notification save failed");
            }

            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("id", saved.getId());
            notificationData.put("title", saved.getTitle());
            notificationData.put("message", saved.getMessage());
            notificationData.put("type", saved.getType());
            notificationData.put("timestamp", saved.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            notificationData.put("appointmentId", saved.getAppointmentId());
            notificationData.put("prescriptionId", saved.getPrescriptionId());
            notificationData.put("reminderTime", saved.getReminderTime() != null ? saved.getReminderTime().toString() : null);
            notificationData.put("frequency", saved.getFrequency());
            notificationData.put("isRead", saved.isRead());

            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    notificationData
            );

            System.out.println("📱 Real-time notification sent to user: " + userId);

        } catch (Exception e) {
            System.err.println("❌ Error saving notification: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save notification", e);
        }
    }

    public void sendAppointmentNotification(Long userId, Long appointmentId, Notification.NotificationType type, String details) {
        String title, message;
        switch (type) {
            case APPOINTMENT_CONFIRMATION:
                title = "Appointment Confirmed";
                message = "Your appointment has been confirmed. Details: " + details;
                break;
            case APPOINTMENT_REMINDER:
                title = "Appointment Reminder";
                message = "Reminder: You have an upcoming appointment. Details: " + details;
                break;
            case APPOINTMENT_CANCELLATION:
                title = "Appointment Cancelled";
                message = "Your appointment has been cancelled. Details: " + details;
                break;
            default:
                throw new IllegalArgumentException("Invalid appointment notification type");
        }
        sendNotification(userId, title, message, type, appointmentId, null, null, null);
    }

    public void sendPrescriptionNotification(Long userId, Long prescriptionId, Notification.NotificationType type, String details) {
        String title, message;
        switch (type) {
            case PRESCRIPTION_ISSUED:
                title = "New Prescription Issued";
                message = "A new prescription has been issued for you. Details: " + details;
                break;
            case PRESCRIPTION_REFILL:
                title = "Prescription Refill Reminder";
                message = "It's time to refill your prescription. Details: " + details;
                break;
            default:
                throw new IllegalArgumentException("Invalid prescription notification type");
        }
        sendNotification(userId, title, message, type, null, prescriptionId, null, null);
    }

    public void sendMedicineReminderNotification(Long userId, Long prescriptionId, String medicineName, LocalTime reminderTime, String frequency, String dosage) {
        String title = "Medicine Reminder: " + medicineName;
        String message = "Time to take your medicine: " + medicineName + ". Dosage: " + dosage + ". Frequency: " + frequency;
        sendNotification(userId, title, message, Notification.NotificationType.MEDICINE_REMINDER, null, prescriptionId, reminderTime, frequency);
    }

    @Scheduled(cron = "0 * * * * *") // Run every minute
    @Transactional
    public void checkMedicineReminders() {
        LocalTime currentTime = LocalTime.now().withSecond(0).withNano(0);
        List<Notification> reminders = notificationRepository.findAll().stream()
                .filter(n -> n.getType() == Notification.NotificationType.MEDICINE_REMINDER)
                .filter(n -> n.getReminderTime() != null && n.getReminderTime().equals(currentTime))
                .toList();

        for (Notification reminder : reminders) {
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("id", reminder.getId());
            notificationData.put("title", reminder.getTitle());
            notificationData.put("message", reminder.getMessage());
            notificationData.put("type", reminder.getType());
            notificationData.put("timestamp", reminder.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            notificationData.put("prescriptionId", reminder.getPrescriptionId());
            notificationData.put("reminderTime", reminder.getReminderTime().toString());
            notificationData.put("frequency", reminder.getFrequency());
            notificationData.put("isRead", reminder.isRead());

            messagingTemplate.convertAndSendToUser(
                    reminder.getUserId().toString(),
                    "/queue/notifications",
                    notificationData
            );

            System.out.println("📱 Sent medicine reminder to user: " + reminder.getUserId());

            if ("DAILY".equals(reminder.getFrequency()) || "TWICE_DAILY".equals(reminder.getFrequency())) {
                reminder.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(reminder);
            } else {
                reminder.setRead(true);
                notificationRepository.save(reminder);
            }
        }
    }

    public void sendSystemAlert(Long userId, String message) {
        sendNotification(userId, "System Alert", message, Notification.NotificationType.SYSTEM_ALERT, null, null, null, null);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public List<Notification> getAppointmentNotifications(Long appointmentId) {
        return notificationRepository.findByAppointmentIdOrderByCreatedAtDesc(appointmentId);
    }

    public List<Notification> getPrescriptionNotifications(Long prescriptionId) {
        return notificationRepository.findByPrescriptionIdOrderByCreatedAtDesc(prescriptionId);
    }

    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(UUID notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void clearAllNotifications(Long userId) {
        List<Notification> userNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(userNotifications);
    }
}