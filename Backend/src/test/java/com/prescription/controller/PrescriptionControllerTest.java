package com.prescription.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.prescription.dto.*;
import com.prescription.service.PrescriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static com.prescription.entity.MedicineTiming.MealRelation.AFTER_MEAL;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PrescriptionControllerTest {

    @Mock
    private PrescriptionService prescriptionService;

    @InjectMocks
    private PrescriptionController prescriptionController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UserDto createMockUser(Long id, String role) {
        UserDto user = new UserDto();
        user.setId(id);
        user.setRole(role);
        return user;
    }

    private MedicineSearchDto createMockMedicineSearch(Long id, String name) {
        MedicineSearchDto medicine = new MedicineSearchDto();
        medicine.setId(id);
        medicine.setName(name);
        medicine.setGenericName("Generic " + name);
        medicine.setStrength("500mg");
        medicine.setForm("Tablet");
        medicine.setPrice(new BigDecimal("10.00"));
        medicine.setManufacturer("Pharma Inc.");
        medicine.setCategory("Analgesic");
        medicine.setDescription("{\"info\": \"Pain reliever\"}");
        return medicine;
    }

    private MedicineTimingCreateDto createMockMedicineTimingCreate(String mealRelation, String timeOfDay, BigDecimal amount, LocalTime specificTime) {
        MedicineTimingCreateDto timing = new MedicineTimingCreateDto();
        timing.setMealRelation(mealRelation);
        timing.setTimeOfDay(timeOfDay);
        timing.setAmount(amount);
        timing.setSpecificTime(specificTime);
        timing.setIntervalHours(12);
        return timing;
    }

    private MedicineTimingDto createMockMedicineTiming(Long id, String mealRelation, String timeOfDay, BigDecimal amount, LocalTime specificTime) {
        MedicineTimingDto timing = new MedicineTimingDto();
        timing.setId(id);
        timing.setMealRelation(mealRelation);
        timing.setTimeOfDay(timeOfDay);
        timing.setAmount(amount);
        timing.setSpecificTime(specificTime);
        timing.setIntervalHours(12);
        return timing;
    }

    private PrescriptionMedicineCreateDto createMockPrescriptionMedicineCreate(Long medicineId, Integer durationDays, String instructions) {
        PrescriptionMedicineCreateDto medicineCreate = new PrescriptionMedicineCreateDto();
        medicineCreate.setMedicineId(medicineId);
        medicineCreate.setDurationDays(durationDays);
        medicineCreate.setSpecialInstructions(instructions);
        medicineCreate.setTimings(Arrays.asList(
                createMockMedicineTimingCreate("AFTER_MEAL", "MORNING", new BigDecimal("1.0"), LocalTime.of(8, 0)),
                createMockMedicineTimingCreate("AFTER_MEAL", "EVENING", new BigDecimal("1.0"), LocalTime.of(20, 0))
        ));
        return medicineCreate;
    }

    private PrescriptionMedicineDto createMockPrescriptionMedicine(Long id, Long medicineId, String medicineName, Integer durationDays, String instructions) {
        PrescriptionMedicineDto medicineDto = new PrescriptionMedicineDto();
        medicineDto.setId(id);
        medicineDto.setMedicine(createMockMedicineSearch(medicineId, medicineName));
        medicineDto.setDurationDays(durationDays);
        medicineDto.setSpecialInstructions(instructions);
        medicineDto.setTimings(Arrays.asList(
                createMockMedicineTiming(1L, "AFTER_MEAL", "MORNING", new BigDecimal("1.0"), LocalTime.of(8, 0)),
                createMockMedicineTiming(2L, "AFTER_MEAL", "EVENING", new BigDecimal("1.0"), LocalTime.of(20, 0))
        ));
        return medicineDto;
    }

    private PrescriptionDto createMockPrescription(Long id, UserDto doctor, UserDto patient, String diagnosis, LocalDate issueDate, LocalDate followUpDate, String advice) {
        PrescriptionDto prescription = new PrescriptionDto();
        prescription.setId(id);
        prescription.setDoctor(doctor);
        prescription.setPatient(patient);
        prescription.setDiagnosis(diagnosis);
        prescription.setIssueDate(issueDate);
        prescription.setFollowUpDate(followUpDate);
        prescription.setAdvice(advice);
        prescription.setMedicines(Arrays.asList(
                createMockPrescriptionMedicine(1L, 1L, "Paracetamol", 7, "Take after meals")
        ));
        prescription.setCreatedAt(LocalDateTime.now());
        return prescription;
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(prescriptionController).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void testCreatePrescriptionSuccess() throws Exception {
        // Arrange
        Long doctorId = 1L;
        Long patientId = 2L;
        LocalDate issueDate = LocalDate.of(2025, 7, 9);
        LocalDate followUpDate = LocalDate.of(2025, 7, 16);

        PrescriptionCreateDto createDto = new PrescriptionCreateDto();
        createDto.setDiagnosis("Flu");
        createDto.setPatientId(patientId);
        createDto.setFollowUpDate(followUpDate);
        createDto.setAdvice("Rest and hydrate");
        createDto.setMedicines(Arrays.asList(
                createMockPrescriptionMedicineCreate(1L, 7, "Take after meals")
        ));

        UserDto doctor = createMockUser(doctorId, "DOCTOR");
        UserDto patient = createMockUser(patientId, "PATIENT");
        PrescriptionDto prescriptionDto = createMockPrescription(101L, doctor, patient, "Flu", issueDate, followUpDate, "Rest and hydrate");

        when(prescriptionService.createPrescription(any(PrescriptionCreateDto.class), eq(doctorId)))
                .thenReturn(prescriptionDto);

        // Act & Assert
        mockMvc.perform(post("/prescriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto))
                        .requestAttr("userId", doctorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101L))
                .andExpect(jsonPath("$.diagnosis").value("Flu"))
                .andExpect(jsonPath("$.issueDate[0]").value(2025))
                .andExpect(jsonPath("$.issueDate[1]").value(7))
                .andExpect(jsonPath("$.issueDate[2]").value(9))
                .andExpect(jsonPath("$.followUpDate[0]").value(2025))
                .andExpect(jsonPath("$.followUpDate[1]").value(7))
                .andExpect(jsonPath("$.followUpDate[2]").value(16))
                .andExpect(jsonPath("$.advice").value("Rest and hydrate"))
                .andExpect(jsonPath("$.doctor.id").value(doctorId))
                .andExpect(jsonPath("$.patient.id").value(patientId))
                .andExpect(jsonPath("$.medicines[0].id").value(1L))
                .andExpect(jsonPath("$.medicines[0].medicine.id").value(1L))
                .andExpect(jsonPath("$.medicines[0].medicine.name").value("Paracetamol"))
                .andExpect(jsonPath("$.medicines[0].medicine.genericName").value("Generic Paracetamol"))
                .andExpect(jsonPath("$.medicines[0].medicine.strength").value("500mg"))
                .andExpect(jsonPath("$.medicines[0].medicine.form").value("Tablet"))
                .andExpect(jsonPath("$.medicines[0].medicine.price").value(10.00))
                .andExpect(jsonPath("$.medicines[0].medicine.manufacturer").value("Pharma Inc."))
                .andExpect(jsonPath("$.medicines[0].medicine.category").value("Analgesic"))
                .andExpect(jsonPath("$.medicines[0].medicine.description").value("{\"info\": \"Pain reliever\"}"))
                .andExpect(jsonPath("$.medicines[0].durationDays").value(7))
                .andExpect(jsonPath("$.medicines[0].specialInstructions").value("Take after meals"))
                .andExpect(jsonPath("$.medicines[0].timings[0].id").value(1L))
                .andExpect(jsonPath("$.medicines[0].timings[0].mealRelation").value("AFTER_MEAL"))
                .andExpect(jsonPath("$.medicines[0].timings[0].timeOfDay").value("MORNING"))
                .andExpect(jsonPath("$.medicines[0].timings[0].amount").value(1.0))
                .andExpect(jsonPath("$.medicines[0].timings[0].specificTime[0]").value(8))
                .andExpect(jsonPath("$.medicines[0].timings[0].specificTime[1]").value(0))
                .andExpect(jsonPath("$.medicines[0].timings[0].intervalHours").value(12))
                .andExpect(jsonPath("$.medicines[0].timings[1].id").value(2L))
                .andExpect(jsonPath("$.medicines[0].timings[1].mealRelation").value("AFTER_MEAL"))
                .andExpect(jsonPath("$.medicines[0].timings[1].timeOfDay").value("EVENING"))
                .andExpect(jsonPath("$.medicines[0].timings[1].amount").value(1.0))
                .andExpect(jsonPath("$.medicines[0].timings[1].specificTime[0]").value(20))
                .andExpect(jsonPath("$.medicines[0].timings[1].specificTime[1]").value(0))
                .andExpect(jsonPath("$.medicines[0].timings[1].intervalHours").value(12));

        verify(prescriptionService, times(1)).createPrescription(any(PrescriptionCreateDto.class), eq(doctorId));
    }

    @Test
    void testCreatePrescriptionFailure_MissingDoctorId() throws Exception {
        // Arrange
        PrescriptionCreateDto createDto = new PrescriptionCreateDto();
        createDto.setDiagnosis("Flu");
        createDto.setPatientId(2L);
        createDto.setFollowUpDate(LocalDate.of(2025, 7, 16));
        createDto.setAdvice("Rest and hydrate");
        createDto.setMedicines(Arrays.asList(
                createMockPrescriptionMedicineCreate(1L, 7, "Take after meals")
        ));

        // Act & Assert
        mockMvc.perform(post("/prescriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Doctor ID not found in request"));

        verify(prescriptionService, never()).createPrescription(any(), anyLong());
    }

    @Test
    void testGetDoctorPrescriptionsSuccess() throws Exception {
        // Arrange
        Long doctorId = 1L;
        UserDto doctor = createMockUser(doctorId, "DOCTOR");
        UserDto patient = createMockUser(2L, "PATIENT");
        PrescriptionDto prescription1 = createMockPrescription(101L, doctor, patient, "Flu",
                LocalDate.of(2025, 7, 9), LocalDate.of(2025, 7, 16), "Rest and hydrate");
        PrescriptionDto prescription2 = createMockPrescription(102L, doctor, patient, "Cold",
                LocalDate.of(2025, 7, 8), LocalDate.of(2025, 7, 15), "Take medicine");

        when(prescriptionService.getPrescriptionsByDoctor(doctorId))
                .thenReturn(Arrays.asList(prescription1, prescription2));

        // Act & Assert
        mockMvc.perform(get("/prescriptions/doctor")
                        .requestAttr("userId", doctorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101L))
                .andExpect(jsonPath("$[0].diagnosis").value("Flu"))
                .andExpect(jsonPath("$[0].issueDate[0]").value(2025))
                .andExpect(jsonPath("$[0].issueDate[1]").value(7))
                .andExpect(jsonPath("$[0].issueDate[2]").value(9))
                .andExpect(jsonPath("$[0].doctor.id").value(doctorId))
                .andExpect(jsonPath("$[0].medicines[0].id").value(1L))
                .andExpect(jsonPath("$[0].medicines[0].medicine.name").value("Paracetamol"))
                .andExpect(jsonPath("$[0].medicines[0].durationDays").value(7))
                .andExpect(jsonPath("$[0].medicines[0].timings[0].mealRelation").value("AFTER_MEAL"))
                .andExpect(jsonPath("$[1].id").value(102L))
                .andExpect(jsonPath("$[1].diagnosis").value("Cold"))
                .andExpect(jsonPath("$[1].issueDate[0]").value(2025))
                .andExpect(jsonPath("$[1].issueDate[1]").value(7))
                .andExpect(jsonPath("$[1].issueDate[2]").value(8))
                .andExpect(jsonPath("$[1].medicines[0].id").value(1L))
                .andExpect(jsonPath("$[1].medicines[0].medicine.name").value("Paracetamol"));

        verify(prescriptionService, times(1)).getPrescriptionsByDoctor(doctorId);
    }

    @Test
    void testGetPatientPrescriptionsSuccess() throws Exception {
        // Arrange
        Long patientId = 2L;
        UserDto doctor = createMockUser(1L, "DOCTOR");
        UserDto patient = createMockUser(patientId, "PATIENT");
        PrescriptionDto prescription1 = createMockPrescription(101L, doctor, patient, "Flu",
                LocalDate.of(2025, 7, 9), LocalDate.of(2025, 7, 16), "Rest and hydrate");

        when(prescriptionService.getPrescriptionsByPatient(patientId))
                .thenReturn(Collections.singletonList(prescription1));

        // Act & Assert
        mockMvc.perform(get("/prescriptions/patient")
                        .requestAttr("userId", patientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101L))
                .andExpect(jsonPath("$[0].diagnosis").value("Flu"))
                .andExpect(jsonPath("$[0].issueDate[0]").value(2025))
                .andExpect(jsonPath("$[0].issueDate[1]").value(7))
                .andExpect(jsonPath("$[0].issueDate[2]").value(9))
                .andExpect(jsonPath("$[0].patient.id").value(patientId))
                .andExpect(jsonPath("$[0].medicines[0].id").value(1L))
                .andExpect(jsonPath("$[0].medicines[0].medicine.name").value("Paracetamol"))
                .andExpect(jsonPath("$[0].medicines[0].durationDays").value(7))
                .andExpect(jsonPath("$[0].medicines[0].timings[0].mealRelation").value("AFTER_MEAL"));

        verify(prescriptionService, times(1)).getPrescriptionsByPatient(patientId);
    }

    @Test
    void testGetPatientPrescriptionsByDoctorSuccess() throws Exception {
        // Arrange
        Long patientId = 2L;
        UserDto doctor = createMockUser(1L, "DOCTOR");
        UserDto patient = createMockUser(patientId, "PATIENT");
        PrescriptionDto prescription1 = createMockPrescription(101L, doctor, patient, "Flu",
                LocalDate.of(2025, 7, 9), LocalDate.of(2025, 7, 16), "Rest and hydrate");

        when(prescriptionService.getPrescriptionsByPatient(patientId))
                .thenReturn(Collections.singletonList(prescription1));

        // Act & Assert
        mockMvc.perform(get("/prescriptions/patient/{patientId}", patientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101L))
                .andExpect(jsonPath("$[0].diagnosis").value("Flu"))
                .andExpect(jsonPath("$[0].issueDate[0]").value(2025))
                .andExpect(jsonPath("$[0].issueDate[1]").value(7))
                .andExpect(jsonPath("$[0].issueDate[2]").value(9))
                .andExpect(jsonPath("$[0].patient.id").value(patientId))
                .andExpect(jsonPath("$[0].medicines[0].id").value(1L))
                .andExpect(jsonPath("$[0].medicines[0].medicine.name").value("Paracetamol"))
                .andExpect(jsonPath("$[0].medicines[0].durationDays").value(7))
                .andExpect(jsonPath("$[0].medicines[0].timings[0].mealRelation").value("AFTER_MEAL"));

        verify(prescriptionService, times(1)).getPrescriptionsByPatient(patientId);
    }

//    @Test
//    void testGetPrescriptionByIdSuccess_Doctor() throws Exception {
//        // Arrange
//        Long prescriptionId = 101L;
//        Long doctorId = 1L;
//        Long patientId = 2L;
//        UserDto doctor = createMockUser(doctorId, "DOCTOR");
//        UserDto patient = createMockUser(patientId, "PATIENT");
//        PrescriptionDto prescription = createMockPrescription(prescriptionId, doctor, patient, "Flu",
//                LocalDate.of(2025, 7, 9), LocalDate.of(2025, 7, 16), "Rest and hydrate");
//
//        when(prescriptionService.getPrescriptionById(prescriptionId))
//                .thenReturn(Optional.of(prescription));
//
//        // Act & Assert
//        mockMvc.perform(get("/prescriptions/{id}", prescriptionId)
//                        .requestAttr("userId", doctorId)
//                        .requestAttr("userRole", "DOCTOR"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(101L))
//                .andExpect(jsonPath("$.diagnosis").value("Flu"))
//                .andExpect(jsonPath("$.issueDate[0]").value(2025))
//                .andExpect(jsonPath("$.issueDate[1]").value(7))
//                .andExpect(jsonPath("$.issueDate[2]").value(9))
//                .andExpect(jsonPath("$.doctor.id").value(doctorId))
//                .andExpect(jsonPath("$.patient.id").value(patientId))
//                .andExpect(jsonPath("$.medicines[0].id").value(1L))
//                .andExpect(jsonPath("$.medicines[0].medicine.name").value("Paracetamol"))
//                .andExpect(jsonPath("$.medicines[0].durationDays").value(7))
//                .andExpect(jsonPath("$.medicines[0].timings[0].mealRelation").value("AFTER_MEAL"));
//
//        verify(prescriptionService, times(1)).getPrescriptionById(prescriptionId));
//    }

//    @Test
//    void testGetPrescriptionByIdSuccess_Patient() throws Exception {
//        // Arrange
//        Long prescriptionId = 101L;
//        Long doctorId = 1L;
//        Long patientId = 2L;
//        UserDto doctor = createMockUser(doctorId, "DOCTOR");
//        UserDto patient = createMockUser(patientId, "PATIENT");
//        PrescriptionDto prescription = createMockPrescription(prescriptionId, doctor, patient, "Flu",
//                LocalDate.of(2025, 7, 9), LocalDate.of(2025, 7, 16), "Rest and hydrate");
//
//        when(prescriptionService.getPrescriptionById(prescriptionId))
//                .thenReturn(Optional.of(prescription));
//
//        // Act & Assert
//        mockMvc.perform(get("/prescriptions/{id}", prescriptionId)
//                        .requestAttr("userId", patientId)
//                        .requestAttr("userRole", "PATIENT"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(101L))
//                .andExpect(jsonPath("$.diagnosis").value("Flu"))
//                .andExpect(jsonPath("$.issueDate[0]").value(2025))
//                .andExpect(jsonPath("$.issueDate[1]").value(7))
//                .andExpect(jsonPath("$.issueDate[2]").value(9))
//                .andExpect(jsonPath("$.doctor.id").value(doctorId))
//                .andExpect(jsonPath("$.patient.id").value(patientId))
//                .andExpect(jsonPath("$.medicines[0]").value(1L))
//                .andExpect(jsonPath("$.medicines[0].medicine.name").value("Paracetamol"))
//                .andExpect(jsonPath("$.medicines[0].idDays").value(7))
//                .andExpect(jsonPath("$[0].medicines".timings[0].mealRelation.value("AFTER_MEAL")));
//
//                        verify(prescriptionService, times(1)).getPrescriptionById(prescriptionId));
//    }

//    @Test
//    void testGetPrescriptionById_UnauthorizedDoctor() throws Exception {
//        // Arrange
//        Long prescriptionId = 101L;
//        Long doctorId = 1L;
//        Long unauthorizedDoctorId = 999L;
//        Long patientId = 2L;
//        UserDto doctor = createMockUser(doctorId, "DOCTOR");
//        UserDto patient = createMockUser(patientId, "PATIENT");
//        PrescriptionDto prescription = createMockPrescription(prescriptionId, doctor, patient, "Flu",
//                LocalDate.of(2025, 7, 9), LocalDate.of(2025, 7, 16), "Rest and hydrate");
//
//        when(prescriptionService.getPrescriptionById(prescriptionId))
//                .thenReturn(Optional.of(prescription));
//
//        // Act & Assert
//        mockMvc.perform(get("/prescriptions/{id}", prescriptionId)
//                        .requestAttr("userId", unauthorizedDoctorId)
//                        .requestAttr("userRole", "DOCTOR"))
//                .andExpect(status().isForbidden());
//
//        verify(prescriptionService, times(1)).getPrescriptionById(prescriptionId))
//    }

//    @Test
//    void testGetPrescriptionById_NotFound() throws Exception {
//        // Arrange
//        Long prescriptionId = 101L;
//        Long patientId = 2L;
//
//        when(prescriptionService.getPrescriptionById(prescriptionId))
//                .thenReturn(Optional.empty());
//
//        // Act & Assert
//        mockMvc.perform(get("/prescriptions/{id}", prescriptionId)
//                        .requestAttr("userId", patientId)
//                        .requestAttr("userRole", "PATIENT"))
//                .andExpect(status().isNotFound());
//
//        verify(prescriptionService, times(1)).getPrescriptionById(prescriptionId));
//    }
}