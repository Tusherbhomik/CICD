package com.prescription.dto.admin;

import com.prescription.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminListResponseDTO {

    private String message;
    private List<AdminSummary> admins;
    private int totalCount;
    private boolean hasMoreData;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminSummary {
        private Long id;
        private String name;
        private String email;
        private Admin.AdminLevel adminLevel;
        private Admin.AdminStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;
        private String createdByName;

        // Constructor from Admin entity
        public AdminSummary(Admin admin, String createdByName) {
            this.id = admin.getId();
            this.name = admin.getName();
            this.email = admin.getEmail();
            this.adminLevel = admin.getAdminLevel();
            this.status = admin.getStatus();
            this.createdAt = admin.getCreatedAt();
            this.lastLogin = admin.getLastLogin();
            this.createdByName = createdByName;
        }
    }
}
