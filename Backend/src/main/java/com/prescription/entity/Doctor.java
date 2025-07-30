package com.prescription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "doctors")
@EntityListeners(AuditingEntityListener.class)
public class Doctor {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String institute;

    @NotBlank
    @Column(nullable = false)
    private String specialization;

    @NotBlank
    @Column(name = "license_number", nullable = false)
    private String licenseNumber;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Doctor() {}

    // KEEP THIS CONSTRUCTOR!
    public Doctor(Long userId, String institute, String specialization, String licenseNumber) {
        this.userId = userId;
        this.institute = institute;
        this.specialization = specialization;
        this.licenseNumber = licenseNumber;
    }
}
