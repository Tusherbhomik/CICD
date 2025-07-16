// AdminLoginResponseDTO.java
package com.prescription.dto.admin;

import com.prescription.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginResponseDTO {
    private String message;
    private AdminInfo admin;
    private String token; // JWT token
    private LocalDateTime loginTime;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminInfo {
        private Long id;
        private String name;
        private String email;
        private String adminLevel;
        private String status;
        private boolean canManageAdmins;
        private LocalDateTime lastLogin;
        private LocalDateTime loginTime;

        public AdminInfo(Admin admin) {
            this.id = admin.getId();
            this.name = admin.getName();
            this.email = admin.getEmail();
            this.adminLevel = admin.getAdminLevel().name();
            this.status = admin.getStatus().name();
            this.canManageAdmins = admin.canManageAdmins();
            this.lastLogin = admin.getLastLogin();
            this.loginTime = LocalDateTime.now();
        }
    }
}