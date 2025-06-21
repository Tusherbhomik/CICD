package com.prescription.dto;

import com.prescription.entity.Appointment;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
public class AppointmentScheduleDTO {

    // Getters and Setters
    @NotNull(message = "Scheduled time is required")
    @Future(message = "Scheduled time must be in the future")
    private LocalDateTime scheduledTime;

    @NotNull(message = "Appointment type is required")
    private Appointment.Type type;

    @NotBlank(message = "Location is required")
    private String location;

    private String notes;

    public AppointmentScheduleDTO(LocalDateTime scheduledTime, Appointment.Type type, String location, String notes) {
        this.scheduledTime = scheduledTime;
        this.type = type;
        this.location = location;
        this.notes = notes;
    }

}
