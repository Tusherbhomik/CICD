package com.prescription.controller;

import com.prescription.entity.Notification;
import com.prescription.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                System.err.println(" User ID is null in getNotifications");
                return ResponseEntity.status(401).body(Map.of("success", false, "error", "User not authenticated"));
            }
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            long unreadCount = notificationService.getUnreadCount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notifications", notifications);
            response.put("unreadCount", unreadCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(" Error in getNotifications: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Object>> getUnreadNotifications(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                System.err.println(" User ID is null in getUnreadNotifications");
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "User not authenticated"));
            }
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            long unreadCount = notifications.size();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "notifications", notifications,
                    "unreadCount", unreadCount
            ));
        } catch (Exception e) {
            System.err.println(" Error in getUnreadNotifications: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/prescription/{prescriptionId}/reminders")
    public ResponseEntity<Map<String, Object>> getMedicineReminders(@PathVariable Long prescriptionId, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                System.err.println(" User ID is null in getMedicineReminders");
                return ResponseEntity.status(401).body(Map.of("success", false, "error", "User not authenticated"));
            }
            List<Notification> reminders = notificationService.getPrescriptionNotifications(prescriptionId).stream()
                    .filter(n -> n.getType() == Notification.NotificationType.MEDICINE_REMINDER)
                    .toList();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "reminders", reminders
            ));
        } catch (Exception e) {
            System.err.println(" Error in getMedicineReminders: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable UUID id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                System.err.println(" User ID is null in markAllAsRead");
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "User not authenticated"));
            }
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read"));
        } catch (Exception e) {
            System.err.println(" Error in markAllAsRead: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable UUID id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Notification deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<Map<String, Object>> clearAllNotifications(@PathVariable Long userId) {
        try {
            notificationService.clearAllNotifications(userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "All notifications cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        System.out.println(" TEST ENDPOINT CALLED - API is working!");
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification API is working!",
                "timestamp", System.currentTimeMillis()
        ));
    }
}