//package com.prescription.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
//import com.prescription.dto.AppointmentRequestDTO;
//import com.prescription.dto.AppointmentResponseDTO;
//import com.prescription.dto.AppointmentScheduleDTO;
//import com.prescription.entity.Appointment;
//import com.prescription.entity.User;
//import com.prescription.service.AppointmentService;
//import com.prescription.service.UserService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//import java.util.*;
//
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@ExtendWith(MockitoExtension.class)
//class AppointmentControllerTest {
//
//    @Mock
//    private AppointmentService appointmentService;
//
//    @Mock
//    private UserService userService;
//
//    @InjectMocks
//    private AppointmentController appointmentController;
//
//    private MockMvc mockMvc;
//    private ObjectMapper objectMapper;
//
//    // Helper method to create a mock User
//    private User createMockUser(Long id, String name, String email, User.Role role) {
//        User user = new User();
//        user.setId(id);
//        user.setName(name);
//        user.setEmail(email);
//        user.setRole(role);
//        user.setPhone("1234567890");
//        return user;
//    }
//
//    // Helper method to create a mock Appointment
//    private Appointment createMockAppointment(Long id, User patient, User doctor, Appointment.Status status,
//                                              LocalDateTime scheduledTime) {
//        Appointment appointment = new Appointment();
//        appointment.setId(id);
//        appointment.setPatient(patient);
//        appointment.setDoctor(doctor);
//        appointment.setStatus(status);
//        appointment.setScheduledTime(scheduledTime);
//        appointment.setType(Appointment.Type.VIDEO);
//        appointment.setNotes("General checkup");
//        appointment.setCreatedAt(LocalDateTime.now());
//        appointment.setUpdatedAt(LocalDateTime.now());
//        return appointment;
//    }
//
//    @BeforeEach
//    void setUp() {
//        mockMvc = MockMvcBuilders.standaloneSetup(appointmentController).build();
//        objectMapper = new ObjectMapper();
//        objectMapper.registerModule(new JavaTimeModule());
//    }
//
//    // ============= PATIENT ENDPOINTS TESTS =============
//
//    @Test
//    void testRequestAppointmentSuccess() throws Exception {
//        // Arrange
//        Long patientId = 1L;
//        Long doctorId = 2L;
//        LocalDate appointmentDate = LocalDate.of(2025, 7, 13);
//        LocalTime appointmentTime = LocalTime.of(10, 0);
//        LocalDateTime scheduledTime = LocalDateTime.of(appointmentDate, appointmentTime);
//
//        AppointmentRequestDTO requestDTO = new AppointmentRequestDTO();
//        requestDTO.setPatientId(patientId);
//        requestDTO.setDoctorId(doctorId);
//        requestDTO.setAppointmentDate(appointmentDate);
//        requestDTO.setAppointmentTime(appointmentTime);
//        requestDTO.setType(Appointment.Type.VIDEO);
//        requestDTO.setReason("Routine checkup");
//
//        User patient = createMockUser(patientId, "Patient John", "patient@example.com", User.Role.PATIENT);
//        User doctor = createMockUser(doctorId, "Doctor Jane", "doctor@example.com", User.Role.DOCTOR);
//        Appointment appointment = createMockAppointment(101L, patient, doctor, Appointment.Status.SCHEDULED, scheduledTime);
//
//        when(userService.getUserById(patientId)).thenReturn(Optional.of(patient));
//        when(userService.getUserById(doctorId)).thenReturn(Optional.of(doctor));
//        when(appointmentService.requestAppointment(
//                eq(doctorId), eq(patientId), any(LocalDate.class), any(LocalTime.class), any(Appointment.Type.class), anyString()))
//                .thenReturn(appointment);
//
//        // Act & Assert
//        mockMvc.perform(post("/appointments/request")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(requestDTO))
//                        .requestAttr("userId", patientId))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.success").value(true))
//                .andExpect(jsonPath("$.message").value("Appointment request sent successfully"))
//                .andExpect(jsonPath("$.appointment.id").value(101L))
//                .andExpect(jsonPath("$.appointment.status").value("SCHEDULED"))
//                .andExpect(jsonPath("$.appointment.type").value("VIDEO"))
//                .andExpect(jsonPath("$.appointment.doctor.id").value(doctorId))
//                .andExpect(jsonPath("$.appointment.patient.id").value(patientId))
//                .andExpect(jsonPath("$.appointment.scheduledTime[0]").value(2025))
//                .andExpect(jsonPath("$.appointment.scheduledTime[1]").value(7))
//                .andExpect(jsonPath("$.appointment.scheduledTime[2]").value(13))
//                .andExpect(jsonPath("$.appointment.scheduledTime[3]").value(10))
//                .andExpect(jsonPath("$.appointment.scheduledTime[4]").value(0));
//        // Alternative for string serialization:
//        // .andExpect(jsonPath("$.appointment.scheduledTime").value("2025-07-13T10:00:00"));
//
//        verify(userService, times(1)).getUserById(patientId);
//        verify(userService, times(1)).getUserById(doctorId);
//        verify(appointmentService, times(1)).requestAppointment(
//                doctorId, patientId, appointmentDate, appointmentTime, Appointment.Type.VIDEO, "Routine checkup");
//    }
//
//    @Test
//    void testRequestAppointmentFailure_PatientNotFound() throws Exception {
//        // Arrange
//        Long patientId = 1L;
//        Long doctorId = 2L;
//        AppointmentRequestDTO requestDTO = new AppointmentRequestDTO();
//        requestDTO.setPatientId(patientId);
//        requestDTO.setDoctorId(doctorId);
//        requestDTO.setAppointmentDate(LocalDate.of(2025, 7, 10)); // Future date to pass @Future validation
//        requestDTO.setAppointmentTime(LocalTime.of(23, 54));
//        requestDTO.setType(Appointment.Type.VIDEO);
//        requestDTO.setReason("Routine checkup");
//
//        when(userService.getUserById(patientId)).thenReturn(Optional.empty());
//        when(userService.getUserById(doctorId)).thenReturn(Optional.empty());
//
//        // Act & Assert
//        mockMvc.perform(post("/appointments/request")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(requestDTO))
//                        .requestAttr("userId", patientId))
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.success").value(false))
//                .andExpect(jsonPath("$.message").value("Patient not found"));
//
//        verify(userService, times(1)).getUserById(patientId);
//        verify(userService, times(1)).getUserById(doctorId);
//        verify(appointmentService, never()).requestAppointment(anyLong(), anyLong(), any(), any(), any(), anyString());
//    }
//
//    @Test
//    void testScheduleAppointmentSuccess() throws Exception {
//        // Arrange
//        Long appointmentId = 103L;
//        Long patientId = 1L;
//        Long doctorId = 2L;
//        LocalDateTime scheduledTime = LocalDateTime.of(2025, 7, 10, 10, 30);
//        String notes = "Bring previous reports";
//        String location = "Clinic A";
//
//        AppointmentScheduleDTO scheduleDTO = new AppointmentScheduleDTO();
//        scheduleDTO.setScheduledTime(scheduledTime);
//        scheduleDTO.setType(Appointment.Type.IN_PERSON);
//        scheduleDTO.setNotes(notes);
//        scheduleDTO.setLocation(location);
//
//        User patient = createMockUser(patientId, "Patient John", "patient@example.com", User.Role.PATIENT);
//        User doctor = createMockUser(doctorId, "Doctor Jane", "doctor@example.com", User.Role.DOCTOR);
//        Appointment existingAppointment = createMockAppointment(appointmentId, patient, doctor,
//                Appointment.Status.REQUESTED, LocalDateTime.now().plusDays(2).withHour(11).withMinute(0));
//        Appointment scheduledAppointment = createMockAppointment(appointmentId, patient, doctor,
//                Appointment.Status.CONFIRMED, scheduledTime);
//        scheduledAppointment.setType(Appointment.Type.IN_PERSON);
//        scheduledAppointment.setNotes(notes);
//
//        when(appointmentService.findById(appointmentId)).thenReturn(existingAppointment);
//        when(appointmentService.scheduleAppointment(appointmentId, scheduledTime, Appointment.Type.IN_PERSON, location, notes))
//                .thenReturn(scheduledAppointment);
//
//        // Act & Assert
//        mockMvc.perform(post("/appointments/{appointmentId}/schedule", appointmentId)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(scheduleDTO)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.success").value(true))
//                .andExpect(jsonPath("$.message").value("Appointment scheduled successfully"))
//                .andExpect(jsonPath("$.appointment.id").value(appointmentId))
//                .andExpect(jsonPath("$.appointment.status").value("CONFIRMED"))
//                .andExpect(jsonPath("$.appointment.type").value("IN_PERSON"))
//                .andExpect(jsonPath("$.appointment.notes").value(notes))
//                .andExpect(jsonPath("$.appointment.doctor.id").value(doctorId))
//                .andExpect(jsonPath("$.appointment.patient.id").value(patientId))
//                .andExpect(jsonPath("$.appointment.scheduledTime[0]").value(2025))
//                .andExpect(jsonPath("$.appointment.scheduledTime[1]").value(7))
//                .andExpect(jsonPath("$.appointment.scheduledTime[2]").value(10))
//                .andExpect(jsonPath("$.appointment.scheduledTime[3]").value(10))
//                .andExpect(jsonPath("$.appointment.scheduledTime[4]").value(30));
//        // Alternative for string serialization:
//        // .andExpect(jsonPath("$.appointment.scheduledTime").value("2025-07-10T10:30:00"));
//
//        verify(appointmentService, times(1)).findById(appointmentId);
//        verify(appointmentService, times(1)).scheduleAppointment(appointmentId, scheduledTime, Appointment.Type.IN_PERSON, location, notes);
//    }
//
//    @Test
//    void testGetPatientAppointments_AllStatusSuccess() throws Exception {
//        // Arrange
//        Long patientId = 1L;
//        User patient = createMockUser(patientId, "Patient John", "patient@example.com", User.Role.PATIENT);
//        User doctor = createMockUser(2L, "Doctor Jane", "doctor@example.com", User.Role.DOCTOR);
//
//        List<Appointment> appointments = Arrays.asList(
//                createMockAppointment(101L, patient, doctor, Appointment.Status.CONFIRMED,
//                        LocalDateTime.of(2025, 7, 8, 9, 0)),
//                createMockAppointment(102L, patient, doctor, Appointment.Status.COMPLETED,
//                        LocalDateTime.of(2025, 7, 7, 14, 0))
//        );
//
//        when(appointmentService.getAllPatientAppointments(patientId)).thenReturn(appointments);
//
//        // Act & Assert
//        mockMvc.perform(get("/appointments/patient/{patientId}/appointments", patientId))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$[0].id").value(101L))
//                .andExpect(jsonPath("$[0].status").value("CONFIRMED"))
//                .andExpect(jsonPath("$[0].type").value("VIDEO"))
//                .andExpect(jsonPath("$[0].patient.id").value(patientId))
//                .andExpect(jsonPath("$[0].doctor.id").value(2L))
//                .andExpect(jsonPath("$[0].scheduledTime[0]").value(2025))
//                .andExpect(jsonPath("$[0].scheduledTime[1]").value(7))
//                .andExpect(jsonPath("$[0].scheduledTime[2]").value(8))
//                .andExpect(jsonPath("$[0].scheduledTime[3]").value(9))
//                .andExpect(jsonPath("$[0].scheduledTime[4]").value(0))
//                .andExpect(jsonPath("$[1].id").value(102L))
//                .andExpect(jsonPath("$[1].status").value("COMPLETED"))
//                .andExpect(jsonPath("$[1].scheduledTime[0]").value(2025))
//                .andExpect(jsonPath("$[1].scheduledTime[1]").value(7))
//                .andExpect(jsonPath("$[1].scheduledTime[2]").value(7))
//                .andExpect(jsonPath("$[1].scheduledTime[3]").value(14))
//                .andExpect(jsonPath("$[1].scheduledTime[4]").value(0));
//        // Alternative for string serialization:
//        // .andExpect(jsonPath("$[0].scheduledTime").value("2025-07-08T09:00:00"))
//        // .andExpect(jsonPath("$[1].scheduledTime").value("2025-07-07T14:00:00"));
//
//        verify(appointmentService, times(1)).getAllPatientAppointments(patientId);
//        verify(appointmentService, never()).getPatientAppointmentsByStatus(anyLong(), any());
//    }
//
//    @Test
//    void testGetAppointmentDetailsSuccess() throws Exception {
//        // Arrange
//        Long appointmentId = 110L;
//        User patient = createMockUser(1L, "Patient John", "patient@example.com", User.Role.PATIENT);
//        User doctor = createMockUser(2L, "Doctor Jane", "doctor@example.com", User.Role.DOCTOR);
//        Appointment appointment = createMockAppointment(appointmentId, patient, doctor,
//                Appointment.Status.CONFIRMED, LocalDateTime.of(2025, 7, 8, 10, 0));
//
//        when(appointmentService.findById(appointmentId)).thenReturn(appointment);
//
//        // Act & Assert
//        mockMvc.perform(get("/appointments/{appointmentId}", appointmentId))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(appointmentId))
//                .andExpect(jsonPath("$.status").value("CONFIRMED"))
//                .andExpect(jsonPath("$.type").value("VIDEO"))
//                .andExpect(jsonPath("$.patient.name").value("Patient John"))
//                .andExpect(jsonPath("$.doctor.name").value("Doctor Jane"))
//                .andExpect(jsonPath("$.scheduledTime[0]").value(2025))
//                .andExpect(jsonPath("$.scheduledTime[1]").value(7))
//                .andExpect(jsonPath("$.scheduledTime[2]").value(8))
//                .andExpect(jsonPath("$.scheduledTime[3]").value(10))
//                .andExpect(jsonPath("$.scheduledTime[4]").value(0));
//        // Alternative for string serialization:
//        // .andExpect(jsonPath("$.scheduledTime").value("2025-07-08T10:00:00"));
//
//        verify(appointmentService, times(1)).findById(appointmentId);
//    }
//
//    // ... Other tests follow similar patterns with updated JSON paths for scheduledTime ...
//}