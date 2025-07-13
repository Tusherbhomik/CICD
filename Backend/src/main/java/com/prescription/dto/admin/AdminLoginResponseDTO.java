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
    private AdminLoginResponseDTO.AdminInfo admin;
    private String token; // JWT token if using JWT
    private LocalDateTime loginTime;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminInfo {
        private Long id;
        private String name;
        private String email;
        private Admin.AdminLevel adminLevel;
        private Admin.AdminStatus status;
        private LocalDateTime lastLogin;
        private boolean canManageAdmins;

        // Constructor from Admin entity
        public AdminInfo(Admin admin) {
            this.id = admin.getId();
            this.name = admin.getName();
            this.email = admin.getEmail();
            this.adminLevel = admin.getAdminLevel();
            this.status = admin.getStatus();
            this.lastLogin = admin.getLastLogin();
            this.canManageAdmins = admin.canManageAdmins();
        }
    }
}
