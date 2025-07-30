package com.prescription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// Medicine Generic Entity
@Data
@Entity
@Table(name = "medicine_generics")
@EntityListeners(AuditingEntityListener.class)
public class MedicineGeneric {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "generic_name", nullable = false, unique = true)
    private String genericName;

    @NotBlank
    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "JSON")
    private String description; // JSON string containing side effects, usage, etc.

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public MedicineGeneric() {}

    public MedicineGeneric(String genericName, String category, String description) {
        this.genericName = genericName;
        this.category = category;
        this.description = description;
    }

}

