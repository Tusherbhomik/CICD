// AdminSignupResponseDTO.java
package com.prescription.dto.admin;

import com.prescription.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSignupResponseDTO {
    private String message;
    private AdminInfo admin;
    private String token; // JWT token (null if requires approval)
    private LocalDateTime createdAt;
    private boolean requiresApproval;

    // Constructor for cases without token
    public AdminSignupResponseDTO(String message, AdminInfo admin, LocalDateTime createdAt, boolean requiresApproval) {
        this.message = message;
        this.admin = admin;
        this.createdAt = createdAt;
        this.requiresApproval = requiresApproval;
        this.token = null; // No token if requires approval
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminInfo {
        private Long id;
        private String name;
        private String email;
        private String adminLevel;
        private String status;
        private LocalDateTime createdAt;

        public AdminInfo(Admin admin) {
            this.id = admin.getId();
            this.name = admin.getName();
            this.email = admin.getEmail();
            this.adminLevel = admin.getAdminLevel().name();
            this.status = admin.getStatus().name();
            this.createdAt = admin.getCreatedAt();
        }
    }
}