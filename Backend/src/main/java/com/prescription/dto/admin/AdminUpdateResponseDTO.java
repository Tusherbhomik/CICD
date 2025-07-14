// AdminUpdateResponseDTO.java (New)
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
public class AdminUpdateResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String adminLevel;
    private String status;
    private String token; // JWT token (only if email was changed)
    private LocalDateTime updatedAt;

    public AdminUpdateResponseDTO(Admin admin, String token) {
        this.id = admin.getId();
        this.name = admin.getName();
        this.email = admin.getEmail();
        this.phone = admin.getPhone();
        this.adminLevel = admin.getAdminLevel().name();
        this.status = admin.getStatus().name();
        this.token = token;
        this.updatedAt = admin.getUpdatedAt();
    }
}