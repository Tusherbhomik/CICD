package com.prescription.dto;


import com.prescription.entity.Patient;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UpdatePatientResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private String gender;
    private String role;
    private String token;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String bloodType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UpdatePatientResponseBuilder builder() {
        return new UpdatePatientResponseBuilder();
    }
    public static class UpdatePatientResponseBuilder {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private LocalDate birthDate;
        private String gender;
        private String role;
        private String token;
        private BigDecimal heightCm;
        private BigDecimal weightKg;
        private String bloodType;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UpdatePatientResponseBuilder id(Long id) { this.id = id; return this; }
        public UpdatePatientResponseBuilder name(String name) { this.name = name; return this; }
        public UpdatePatientResponseBuilder email(String email) { this.email = email; return this; }
        public UpdatePatientResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public UpdatePatientResponseBuilder birthDate(LocalDate birthDate) { this.birthDate = birthDate; return this; }
        public UpdatePatientResponseBuilder gender(String gender) { this.gender = gender; return this; }
        public UpdatePatientResponseBuilder role(String role) { this.role = role; return this; }
        public UpdatePatientResponseBuilder token(String token) { this.token = token; return this; }
        public UpdatePatientResponseBuilder heightCm(BigDecimal heightCm) { this.heightCm = heightCm; return this; }
        public UpdatePatientResponseBuilder weightKg(BigDecimal weightKg) { this.weightKg = weightKg; return this; }
        public UpdatePatientResponseBuilder bloodType(String bloodType) { this.bloodType = bloodType; return this; }
        public UpdatePatientResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UpdatePatientResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public UpdatePatientResponse build() {
            UpdatePatientResponse response = new UpdatePatientResponse();
            response.id = this.id;
            response.name = this.name;
            response.email = this.email;
            response.phone = this.phone;
            response.birthDate = this.birthDate;
            response.gender = this.gender;
            response.role = this.role;
            response.token = this.token;
            response.heightCm = this.heightCm;
            response.weightKg = this.weightKg;
            response.bloodType = this.bloodType;
            response.createdAt = this.createdAt;
            response.updatedAt = this.updatedAt;
            return response;
        }
    }
}
