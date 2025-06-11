//package com.prescription.config;
//
//import com.prescription.entity.*;
//import com.prescription.repository.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Component;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//
//@Component
//public class DataInitializer implements CommandLineRunner {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private DoctorRepository doctorRepository;
//
//    @Autowired
//    private PatientRepository patientRepository;
//
//    @Autowired
//    private MedicineGenericRepository medicineGenericRepository;
//
//    @Autowired
//    private MedicineRepository medicineRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Override
//    public void run(String... args) throws Exception {
//        // Only initialize if no users exist
//        if (userRepository.count() == 0) {
//            initializeSampleData();
//        }
//    }
//
//    @Transactional
//    private void initializeSampleData() {
//        LocalDateTime now = LocalDateTime.now();
//
//        // Create sample doctor
//        User doctorUser = new User();
//        doctorUser.setName("Dr. John Smith");
//        doctorUser.setEmail("doctor@example.com");
//        doctorUser.setPasswordHash(passwordEncoder.encode("password123"));
//        doctorUser.setRole(User.Role.DOCTOR);
//        doctorUser.setBirthDate(LocalDate.of(1980, 5, 15));
//        doctorUser.setGender(User.Gender.MALE);
//        doctorUser.setPhone("1234567890");
//        doctorUser.setIsVerified(true);
//        // Set timestamp fields
//        doctorUser.setCreatedAt(now);
//        doctorUser.setUpdatedAt(now);
//
//        // Save and keep reference to managed entity
//        doctorUser = userRepository.save(doctorUser);
//
//        Doctor doctor = new Doctor();
//        doctor.setUser(doctorUser); // Use the managed entity
//        doctor.setInstitute("Medical College Hospital");
//        doctor.setSpecialization("General Medicine");
//        doctor.setLicenseNumber("MD12345");
//
//        doctorRepository.save(doctor);
//
//        // Create sample patient
//        User patientUser = new User();
//        patientUser.setName("Jane Doe");
//        patientUser.setEmail("patient@example.com");
//        patientUser.setPasswordHash(passwordEncoder.encode("password123"));
//        patientUser.setRole(User.Role.PATIENT);
//        patientUser.setBirthDate(LocalDate.of(1990, 8, 20));
//        patientUser.setGender(User.Gender.FEMALE);
//        patientUser.setPhone("0987654321");
//        patientUser.setIsVerified(true);
//        // Set timestamp fields
//        patientUser.setCreatedAt(now);
//        patientUser.setUpdatedAt(now);
//
//        // Save and keep reference to managed entity
//        patientUser = userRepository.save(patientUser);
//
//        Patient patient = new Patient();
//        patient.setUser(patientUser); // Use the managed entity
//        patient.setHeightCm(new BigDecimal("165.5"));
//        patient.setWeightKg(new BigDecimal("60.0"));
//        patient.setBloodType(Patient.BloodType.O_POSITIVE);
//
//        patientRepository.save(patient);
//
//        // Create sample medicine generics and medicines
//        createSampleMedicines();
//    }
//
//    @Transactional
//    private void createSampleMedicines() {
//        // Paracetamol
//        MedicineGeneric paracetamolGeneric = new MedicineGeneric();
//        paracetamolGeneric.setGenericName("Paracetamol");
//        paracetamolGeneric.setCategory("Analgesic");
//        paracetamolGeneric.setDescription("{\"sideEffects\":[\"Nausea\",\"Vomiting\",\"Allergic reactions\"],\"usage\":\"For fever and pain relief\",\"contraindications\":[\"Liver disease\",\"Alcohol dependence\"]}");
//        paracetamolGeneric = medicineGenericRepository.save(paracetamolGeneric);
//
//        Medicine paracetamol500 = new Medicine();
//        paracetamol500.setName("Panadol");
//        paracetamol500.setStrength("500mg");
//        paracetamol500.setForm(Medicine.Form.TABLET);
//        paracetamol500.setMedicineGeneric(paracetamolGeneric);
//        paracetamol500.setPrice(new BigDecimal("10.50"));
//        paracetamol500.setManufacturer("GSK");
//        medicineRepository.save(paracetamol500);
//
//        Medicine paracetamol650 = new Medicine();
//        paracetamol650.setName("Crocin");
//        paracetamol650.setStrength("650mg");
//        paracetamol650.setForm(Medicine.Form.TABLET);
//        paracetamol650.setMedicineGeneric(paracetamolGeneric);
//        paracetamol650.setPrice(new BigDecimal("12.00"));
//        paracetamol650.setManufacturer("GSK");
//        medicineRepository.save(paracetamol650);
//
//        // Amoxicillin
//        MedicineGeneric amoxicillinGeneric = new MedicineGeneric();
//        amoxicillinGeneric.setGenericName("Amoxicillin");
//        amoxicillinGeneric.setCategory("Antibiotic");
//        amoxicillinGeneric.setDescription("{\"sideEffects\":[\"Diarrhea\",\"Nausea\",\"Skin rash\",\"Vomiting\"],\"usage\":\"Bacterial infections\",\"contraindications\":[\"Penicillin allergy\",\"Mononucleosis\"]}");
//        amoxicillinGeneric = medicineGenericRepository.save(amoxicillinGeneric);
//
//        Medicine amoxicillin250 = new Medicine();
//        amoxicillin250.setName("Amoxil");
//        amoxicillin250.setStrength("250mg");
//        amoxicillin250.setForm(Medicine.Form.CAPSULE);
//        amoxicillin250.setMedicineGeneric(amoxicillinGeneric);
//        amoxicillin250.setPrice(new BigDecimal("25.00"));
//        amoxicillin250.setManufacturer("Pfizer");
//        medicineRepository.save(amoxicillin250);
//
//        // Metformin
//        MedicineGeneric metforminGeneric = new MedicineGeneric();
//        metforminGeneric.setGenericName("Metformin");
//        metforminGeneric.setCategory("Antidiabetic");
//        metforminGeneric.setDescription("{\"sideEffects\":[\"Nausea\",\"Diarrhea\",\"Stomach upset\",\"Metallic taste\"],\"usage\":\"Type 2 diabetes management\",\"contraindications\":[\"Kidney disease\",\"Liver disease\",\"Heart failure\"]}");
//        metforminGeneric = medicineGenericRepository.save(metforminGeneric);
//
//        Medicine metformin500 = new Medicine();
//        metformin500.setName("Glucophage");
//        metformin500.setStrength("500mg");
//        metformin500.setForm(Medicine.Form.TABLET);
//        metformin500.setMedicineGeneric(metforminGeneric);
//        metformin500.setPrice(new BigDecimal("18.75"));
//        metformin500.setManufacturer("Bristol-Myers Squibb");
//        medicineRepository.save(metformin500);
//
//        System.out.println("Sample data initialized successfully!");
//    }
//}