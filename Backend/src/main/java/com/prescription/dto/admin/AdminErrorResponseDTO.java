package com.prescription.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminErrorResponseDTO {

    private String error;
    private String message;
    private int statusCode;
    private LocalDateTime timestamp;
    private String path;

    public AdminErrorResponseDTO(String error, String message, int statusCode) {
        this.error = error;
        this.message = message;
        this.statusCode = statusCode;
        this.timestamp = LocalDateTime.now();
    }
}
