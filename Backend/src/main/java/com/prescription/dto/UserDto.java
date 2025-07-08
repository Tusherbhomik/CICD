package com.prescription.dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

// User DTOs
@Data
@NoArgsConstructor
public class UserDto {
    // Getters and Setters
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private LocalDate birthDate;
    private String gender;

    public UserDto(Long id, String name, String email, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

}
