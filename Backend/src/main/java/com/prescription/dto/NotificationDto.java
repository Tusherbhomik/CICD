package com.prescription.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NotificationDto {
    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
} 