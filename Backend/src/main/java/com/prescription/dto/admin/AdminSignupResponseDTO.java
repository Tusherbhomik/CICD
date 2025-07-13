package com.prescription.dto.admin;

import com.prescription.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSignupResponseDTO {

    private String message;
    private AdminSignupResponseDTO.AdminInfo admin;
    private LocalDateTime createdAt;
    private boolean requiresApproval;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminInfo {
        private Long id;
        private String name;
        private String email;
        private Admin.AdminLevel adminLevel;
        private Admin.AdminStatus status;
        private LocalDateTime createdAt;

        // Constructor from Admin entity
        public AdminInfo(Admin admin) {
            this.id = admin.getId();
            this.name = admin.getName();
            this.email = admin.getEmail();
            this.adminLevel = admin.getAdminLevel();
            this.status = admin.getStatus();
            this.createdAt = admin.getCreatedAt();
        }
    }
}
