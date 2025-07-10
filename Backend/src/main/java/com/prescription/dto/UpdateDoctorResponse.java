package com.prescription.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UpdateDoctorResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private String gender;
    private String role;
    private String token;
    private String institute;
    private String licenseNumber;
    private String specialization;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Builder pattern
    public static UpdateDoctorResponseBuilder builder() {
        return new UpdateDoctorResponseBuilder();
    }

    public static class UpdateDoctorResponseBuilder {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private LocalDate birthDate;
        private String gender;
        private String role;
        private String token;
        private String institute;
        private String licenseNumber;
        private String specialization;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UpdateDoctorResponseBuilder id(Long id) { this.id = id; return this; }
        public UpdateDoctorResponseBuilder name(String name) { this.name = name; return this; }
        public UpdateDoctorResponseBuilder email(String email) { this.email = email; return this; }
        public UpdateDoctorResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public UpdateDoctorResponseBuilder birthDate(LocalDate birthDate) { this.birthDate = birthDate; return this; }
        public UpdateDoctorResponseBuilder gender(String gender) { this.gender = gender; return this; }
        public UpdateDoctorResponseBuilder role(String role) { this.role = role; return this; }
        public UpdateDoctorResponseBuilder token(String token) { this.token = token; return this; }
        public UpdateDoctorResponseBuilder institute(String institute) { this.institute = institute; return this; }
        public UpdateDoctorResponseBuilder licenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; return this; }
        public UpdateDoctorResponseBuilder specialization(String specialization) { this.specialization = specialization; return this; }
        public UpdateDoctorResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UpdateDoctorResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public UpdateDoctorResponse build() {
            UpdateDoctorResponse response = new UpdateDoctorResponse();
            response.id = this.id;
            response.name = this.name;
            response.email = this.email;
            response.phone = this.phone;
            response.birthDate = this.birthDate;
            response.gender = this.gender;
            response.role = this.role;
            response.token = this.token;
            response.institute = this.institute;
            response.licenseNumber = this.licenseNumber;
            response.specialization = this.specialization;
            response.createdAt = this.createdAt;
            response.updatedAt = this.updatedAt;
            return response;
        }
    }
}
