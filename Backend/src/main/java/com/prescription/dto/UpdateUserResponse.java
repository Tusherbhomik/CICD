package com.prescription.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private String gender;
    private String role;
    private String token;

    // Builder pattern
    public static UpdateUserResponseBuilder builder() {
        return new UpdateUserResponseBuilder();
    }

    public static class UpdateUserResponseBuilder {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private LocalDate birthDate;
        private String gender;
        private String role;
        private String token;

        public UpdateUserResponseBuilder id(Long id) { this.id = id; return this; }
        public UpdateUserResponseBuilder name(String name) { this.name = name; return this; }
        public UpdateUserResponseBuilder email(String email) { this.email = email; return this; }
        public UpdateUserResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public UpdateUserResponseBuilder birthDate(LocalDate birthDate) { this.birthDate = birthDate; return this; }
        public UpdateUserResponseBuilder gender(String gender) { this.gender = gender; return this; }
        public UpdateUserResponseBuilder role(String role) { this.role = role; return this; }
        public UpdateUserResponseBuilder token(String token) { this.token = token; return this; }
        public UpdateUserResponse build() {
            UpdateUserResponse response = new UpdateUserResponse();
            response.id = this.id;
            response.name = this.name;
            response.email = this.email;
            response.phone = this.phone;
            response.birthDate = this.birthDate;
            response.gender = this.gender;
            response.role = this.role;
            response.token = this.token;
            return response;
        }
    }
}
