package com.prescription.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.prescription.dto.NotificationDto;
import com.prescription.entity.Notification;
import com.prescription.entity.User;
import com.prescription.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notificationRepository.save(notification);

        NotificationDto notificationDto = convertToDto(notification);

        messagingTemplate.convertAndSendToUser(
                String.valueOf(user.getId()),
                "/topic/notifications",
                notificationDto
        );
    }

    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private NotificationDto convertToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
} 