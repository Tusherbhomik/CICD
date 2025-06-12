package com.prescription.service;

import com.prescription.dto.*;
import com.prescription.entity.*;
import com.prescription.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PrescriptionMedicineRepository prescriptionMedicineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private MedicineService medicineService;

    public PrescriptionDto createPrescription(PrescriptionCreateDto createDto, Long doctorId) {
        // Validate doctor
        Optional<User> doctorOpt = userRepository.findById(doctorId);
        if (doctorOpt.isEmpty() || doctorOpt.get().getRole() != User.Role.DOCTOR) {
            throw new RuntimeException("Doctor not found with id: " + doctorId);
        }

        // Validate patient
        Optional<User> patientOpt = userRepository.findById(createDto.getPatientId());
        if (patientOpt.isEmpty() || patientOpt.get().getRole() != User.Role.PATIENT) {
            throw new RuntimeException("Patient not found with id: " + createDto.getPatientId());
        }

        User doctor = doctorOpt.get();
        User patient = patientOpt.get();

        // Create prescription
        Prescription prescription = new Prescription();
        prescription.setDiagnosis(createDto.getDiagnosis());
        prescription.setDoctor(doctor);
        prescription.setPatient(patient);
        prescription.setFollowUpDate(createDto.getFollowUpDate());
        prescription.setCreatedAt(LocalDateTime.now());
        prescription.setUpdatedAt(LocalDateTime.now());
        prescription.setAdvice(createDto.getAdvice());


        prescription = prescriptionRepository.save(prescription);


        // Create prescription medicines
        List<PrescriptionMedicine> prescriptionMedicines = new ArrayList<>();

        for (PrescriptionMedicineCreateDto medicineDto : createDto.getMedicines()) {
            Optional<Medicine> medicineOpt = medicineRepository.findById(medicineDto.getMedicineId());
            if (medicineOpt.isEmpty()) {
                throw new RuntimeException("Medicine not found with id: " + medicineDto.getMedicineId());
            }

            PrescriptionMedicine prescriptionMedicine = new PrescriptionMedicine();
            prescriptionMedicine.setPrescription(prescription);
            prescriptionMedicine.setMedicine(medicineOpt.get());
            prescriptionMedicine.setDurationDays(medicineDto.getDurationDays());
            prescriptionMedicine.setSpecialInstructions(medicineDto.getSpecialInstructions());
            prescriptionMedicine.setCreatedAt(prescription.getCreatedAt());
            prescriptionMedicine.setUpdatedAt(prescription.getUpdatedAt());



            prescriptionMedicine = prescriptionMedicineRepository.save(prescriptionMedicine);

            // Create medicine timings
            List<MedicineTiming> timings = new ArrayList<>();
            for (MedicineTimingCreateDto timingDto : medicineDto.getTimings()) {
                MedicineTiming timing = new MedicineTiming();
                timing.setPrescriptionMedicine(prescriptionMedicine);
                timing.setMealRelation(MedicineTiming.MealRelation.valueOf(timingDto.getMealRelation()));
                timing.setTimeOfDay(MedicineTiming.TimeOfDay.valueOf(timingDto.getTimeOfDay()));
                timing.setAmount(timingDto.getAmount());
                timing.setSpecificTime(timingDto.getSpecificTime());
                timing.setIntervalHours(timingDto.getIntervalHours());
                timing.setCreatedAt(prescription.getCreatedAt());
                timing.setUpdatedAt(prescription.getUpdatedAt());
                timings.add(timing);
            }

            prescriptionMedicine.setMedicineTimings(timings);
            prescriptionMedicines.add(prescriptionMedicine);
        }

        prescription.setPrescriptionMedicines(prescriptionMedicines);

        return convertToDto(prescription);
    }

    public List<PrescriptionDto> getPrescriptionsByDoctor(Long doctorId) {
        List<Prescription> prescriptions = prescriptionRepository.findByDoctorId(doctorId);
        List<PrescriptionDto> dtos = new ArrayList<>();

        for (Prescription prescription : prescriptions) {
            dtos.add(convertToDto(prescription));
        }

        return dtos;
    }

    public List<PrescriptionDto> getPrescriptionsByPatient(Long patientId) {
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
        List<PrescriptionDto> dtos = new ArrayList<>();

        for (Prescription prescription : prescriptions) {
            dtos.add(convertToDto(prescription));
        }

        return dtos;
    }

    public Optional<PrescriptionDto> getPrescriptionById(Long id) {
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(id);
        return prescriptionOpt.map(this::convertToDto);
    }

    private PrescriptionDto convertToDto(Prescription prescription) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(prescription.getId());
        dto.setDiagnosis(prescription.getDiagnosis());
        dto.setIssueDate(prescription.getIssueDate());
        dto.setFollowUpDate(prescription.getFollowUpDate());
        dto.setAdvice(prescription.getAdvice());
        dto.setCreatedAt(prescription.getCreatedAt());

        // Convert doctor and patient
        dto.setDoctor(userService.convertToDto(prescription.getDoctor()));
        dto.setPatient(userService.convertToDto(prescription.getPatient()));

        // Convert medicines
        List<PrescriptionMedicineDto> medicineDtos = new ArrayList<>();
        if (prescription.getPrescriptionMedicines() != null) {
            for (PrescriptionMedicine prescriptionMedicine : prescription.getPrescriptionMedicines()) {
                PrescriptionMedicineDto medicineDto = new PrescriptionMedicineDto();
                medicineDto.setId(prescriptionMedicine.getId());
                medicineDto.setDurationDays(prescriptionMedicine.getDurationDays());
                medicineDto.setSpecialInstructions(prescriptionMedicine.getSpecialInstructions());

                // Convert medicine details
                MedicineSearchDto medicineSearchDto = medicineService.convertToSearchDto(prescriptionMedicine.getMedicine());
                medicineDto.setMedicine(medicineSearchDto);

                // Convert timings
                List<MedicineTimingDto> timingDtos = new ArrayList<>();
                if (prescriptionMedicine.getMedicineTimings() != null) {
                    for (MedicineTiming timing : prescriptionMedicine.getMedicineTimings()) {
                        MedicineTimingDto timingDto = new MedicineTimingDto();
                        timingDto.setId(timing.getId());
                        timingDto.setMealRelation(timing.getMealRelation().name());
                        timingDto.setTimeOfDay(timing.getTimeOfDay().name());
                        timingDto.setAmount(timing.getAmount());
                        timingDto.setSpecificTime(timing.getSpecificTime());
                        timingDto.setIntervalHours(timing.getIntervalHours());
                        timingDtos.add(timingDto);
                    }
                }
                medicineDto.setTimings(timingDtos);
                medicineDtos.add(medicineDto);
            }
        }
        dto.setMedicines(medicineDtos);

        return dto;
    }
}