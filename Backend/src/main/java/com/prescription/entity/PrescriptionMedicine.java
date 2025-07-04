package com.prescription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

// Prescription Medicine Entity
@Data
@Entity
@Table(name = "prescription_medicines")
@EntityListeners(AuditingEntityListener.class)
public class PrescriptionMedicine {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @NotNull
    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @OneToMany(mappedBy = "prescriptionMedicine", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicineTiming> medicineTimings;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public PrescriptionMedicine() {
    }

    public PrescriptionMedicine(Prescription prescription, Medicine medicine, Integer durationDays) {
        this.prescription = prescription;
        this.medicine = medicine;
        this.durationDays = durationDays;
    }

}
