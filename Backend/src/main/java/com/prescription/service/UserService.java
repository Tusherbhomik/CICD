package com.prescription.service;
import com.prescription.entity.AppointmentSettings;
import com.prescription.repository.AppointmentSettingsRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.prescription.dto.*;
import com.prescription.entity.Doctor;
import com.prescription.entity.Patient;
import com.prescription.entity.User;
import com.prescription.repository.DoctorRepository;
import com.prescription.repository.PatientRepository;
import com.prescription.repository.UserRepository;
import com.prescription.util.JwtUtil;
import jakarta.validation.Valid;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private AppointmentSettingsRepository appointmentSettingsRepository;

    public LoginResponse authenticate(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with email: " + loginRequest.getEmail());
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        // Create user DTO
        UserDto userDto = convertToDto(user);

        return new LoginResponse(token, userDto);
    }

    public SignUpResponse register(@Valid SignUpRequest req) {

        // 1) uniqueness check
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already exists: " + req.getEmail());
        }

        // 2) map DTO → entity
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(req.getRole())
                .birthDate(req.getBirthDate())
                .gender(req.getGender())
                .isVerified(false)
                .build();

        // 3) save
        User savedUser = userRepository.save(user);

        //tusher  added
        if (savedUser.getRole() == User.Role.DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctor.setLicenseNumber("NOT_SET");
            doctor.setSpecialization("GENERAL");
            doctor.setInstitute("NOT_SET");
            doctor.setCreatedAt(LocalDateTime.now());
            doctor.setUpdatedAt(LocalDateTime.now());
            doctorRepository.save(doctor);

            AppointmentSettings appointmentSettings = new AppointmentSettings();
            appointmentSettings.setDoctor(savedUser);
            appointmentSettings.setAutoApprove(true);
            appointmentSettings.setAllowOverbooking(true);
            appointmentSettings.setSlotDurationMinutes(30);
            appointmentSettings.setBufferTimeMinutes(0);
            appointmentSettings.setAdvanceBookingDays(30);
            appointmentSettingsRepository.save(appointmentSettings);
        } else if (savedUser.getRole() == User.Role.PATIENT) {
             Patient patient = new Patient();
            patient.setUser(savedUser);
            patient.setHeightCm(BigDecimal.ZERO);
            patient.setWeightKg(BigDecimal.ZERO);
            patient.setBloodType(Patient.BloodType.UNKNOWN);
            patient.setCreatedAt(LocalDateTime.now());
            patient.setUpdatedAt(LocalDateTime.now());
            patientRepository.save(patient);
        }

        // 4) create JWT (optional but handy for auto-login)
        String token = jwtUtil.generateToken(
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getId()
        );

        // 5) build response
        return SignUpResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .token(token)
                .build();
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }

        // Encode password
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

        return userRepository.save(user);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setBirthDate(user.getBirthDate());
        dto.setGender(user.getGender().name());
        return dto;
    }


    public List<UserDto> getAllPatients() {
        // Get all users with PATIENT role
        List<User> patientUsers = userRepository.findAllPatients();
        
        // Convert to PatientResponse DTOs
        List<UserDto> responses = new ArrayList<>();
        for (User user : patientUsers) {
            responses.add(convertToDto(user));
        }
        return responses;
    }

    public PatientResponse getPatientById(Long id) {
        // Find patient by user ID
        Patient patient = patientRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        return mapToPatientResponse(patient);
    }

    public List<User> searchDoctors(String specialization,String name) {
        // If all parameters are null, return all available doctors
//        if (specialization == null && location == null && name == null) {
//            return userRepository.findByRoleAndAvailable("DOCTOR", true);
//        }
////
//        // Build dynamic query based on provided parameters
//        if (specialization != null && location != null && name != null) {
//            return userRepository.findByRoleAndSpecializationContainingIgnoreCaseAndLocationContainingIgnoreCaseAndNameContainingIgnoreCaseAndAvailable(
//                    "DOCTOR", specialization, location, name, true);
//        } else if (specialization != null && location != null) {
//            return userRepository.findByRoleAndSpecializationContainingIgnoreCaseAndLocationContainingIgnoreCaseAndAvailable(
//                    "DOCTOR", specialization, location, true);
//        } else if (specialization != null && name != null) {
//            return userRepository.findByRoleAndSpecializationContainingIgnoreCaseAndNameContainingIgnoreCaseAndAvailable(
//                    "DOCTOR", specialization, name, true);
//        } else if (location != null && name != null) {
//            return userRepository.findByRoleAndLocationContainingIgnoreCaseAndNameContainingIgnoreCaseAndAvailable(
//                    "DOCTOR", location, name, true);
//        } else if (specialization != null) {
//            return userRepository.findByRoleAndSpecializationContainingIgnoreCaseAndAvailable(
//                    "DOCTOR", specialization, true);
//        } else if (location != null) {
//            return userRepository.findByRoleAndLocationContainingIgnoreCaseAndAvailable(
//                    "DOCTOR", location, true);
//        } else if (name != null) {
//            return userRepository.findByRoleAndNameContainingIgnoreCaseAndAvailable(
//                    "DOCTOR", name, true);
//        }

        return userRepository.findAllDoctors();
    }

    private PatientResponse mapToPatientResponse(Patient patient) {
        User user = patient.getUser();

        return PatientResponse.builder()
                // User data
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birthDate(user.getBirthDate())
                .gender(user.getGender())
                .profileImage(user.getProfileImage())
                .isVerified(user.getIsVerified())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                // Patient-specific data
                .heightCm(patient.getHeightCm())
                .weightKg(patient.getWeightKg())
                .bloodType(patient.getBloodType())
                .patientCreatedAt(patient.getCreatedAt())
                .patientUpdatedAt(patient.getUpdatedAt())
                .build();
    }

    public List<UserDto> getAllDoctors() {
        List<User> doctorUsers = userRepository.findAllDoctors();

        // Convert to PatientResponse DTOs
        List<UserDto> responses = new ArrayList<>();
        for (User user : doctorUsers) {
            responses.add(convertToDto(user));
        }
        return responses;
    }

    public DoctorResponse getDoctorBYid(Long id)  {
        Doctor doctor= doctorRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        return mapToDoctorResponse(doctor);
    }

    private DoctorResponse mapToDoctorResponse(Doctor doctor) {
        User user = doctor.getUser();

        return DoctorResponse.builder()
                // User data
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birthDate(user.getBirthDate())
                .gender(user.getGender())
                .profileImage(user.getProfileImage())
                .isVerified(user.getIsVerified())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                // Patient-specific data
                .institute(doctor.getInstitute())
                .licenseNumber(doctor.getLicenseNumber())
                .specialization(doctor.getSpecialization())
                .doctorCreatedAt(doctor.getCreatedAt())
                .doctorUpdatedAt(doctor.getUpdatedAt())
                .build();
    }


    @Transactional
    public UpdateDoctorResponse updateDoctorUser(User user, @Valid UpdateDoctorRequest req) {
        if (!user.getRole().equals(User.Role.DOCTOR)) {
            throw new RuntimeException("Only doctors can update doctor-specific fields");
        }

        user.setName(req.getName() != null ? req.getName() : user.getName());
        user.setPhone(req.getPhone() != null ? req.getPhone() : user.getPhone());

        boolean emailChanged = false;
        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new RuntimeException("Email already exists: " + req.getEmail());
            }
            user.setEmail(req.getEmail());
            emailChanged = true;
        }

        User updatedUser = userRepository.saveAndFlush(user);

        Doctor doctor = doctorRepository.findByUserId(updatedUser.getId()).orElseGet(() -> {
            Doctor newDoctor = new Doctor(updatedUser.getId(),
                    req.getInstitute() != null ? req.getInstitute() : "N/A",
                    req.getSpecialization() != null ? req.getSpecialization() : "N/A",
                    req.getLicenseNumber() != null ? req.getLicenseNumber() : "TEMP_LIC");
            newDoctor.setCreatedAt(LocalDateTime.now());
            newDoctor.setUpdatedAt(LocalDateTime.now());
            return newDoctor;
        });

        doctor.setInstitute(req.getInstitute() != null ? req.getInstitute() : doctor.getInstitute());
        doctor.setLicenseNumber(req.getLicenseNumber() != null ? req.getLicenseNumber() : doctor.getLicenseNumber());
        doctor.setSpecialization(req.getSpecialization() != null ? req.getSpecialization() : doctor.getSpecialization());
        doctor.setUpdatedAt(LocalDateTime.now());

        Doctor savedDoctor = doctorRepository.save(doctor);
//        System.out.println("Doctor saved: " + savedDoctor);

        String token = emailChanged ? jwtUtil.generateToken(updatedUser.getEmail(), updatedUser.getRole().name(), updatedUser.getId()) : null;

        return UpdateDoctorResponse.builder()
                .id(updatedUser.getId())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .birthDate(updatedUser.getBirthDate())
                .gender(updatedUser.getGender().toString())
                .role(updatedUser.getRole().toString())
                .institute(savedDoctor.getInstitute())
                .licenseNumber(savedDoctor.getLicenseNumber())
                .specialization(savedDoctor.getSpecialization())
                .createdAt(savedDoctor.getCreatedAt())
                .updatedAt(savedDoctor.getUpdatedAt())
                .token(token)
                .build();
    }

    @Transactional
    public UpdatePatientResponse updatePatientUser(User user, @Valid UpdatePatientRequest req) {
        if (!user.getRole().equals(User.Role.PATIENT)) {
            throw new RuntimeException("Only patients can update patient-specific fields");
        }

        user.setName(req.getName() != null ? req.getName() : user.getName());
        user.setPhone(req.getPhone() != null ? req.getPhone() : user.getPhone());

        boolean emailChanged = false;
        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new RuntimeException("Email already exists: " + req.getEmail());
            }
            user.setEmail(req.getEmail());
            emailChanged = true;
        }

        User updatedUser = userRepository.saveAndFlush(user);

        Patient patient = patientRepository.findByUserId(updatedUser.getId()).orElseGet(() -> {
            Patient newPatient = new Patient(updatedUser.getId(),
                    req.getHeightCm() != null ? req.getHeightCm() : BigDecimal.ZERO,
                    req.getWeightKg() != null ? req.getWeightKg() : BigDecimal.ZERO,
                    req.getBloodType() != null ? mapToBloodType(req.getBloodType()) : Patient.BloodType.UNKNOWN);
            newPatient.setCreatedAt(LocalDateTime.now());
            newPatient.setUpdatedAt(LocalDateTime.now());
            return newPatient;
        });

        patient.setHeightCm(req.getHeightCm() != null ? req.getHeightCm() : patient.getHeightCm());
        patient.setWeightKg(req.getWeightKg() != null ? req.getWeightKg() : patient.getWeightKg());
        patient.setBloodType(req.getBloodType() != null ? mapToBloodType(req.getBloodType()) : patient.getBloodType());
        patient.setUpdatedAt(LocalDateTime.now());

        Patient savedPatient = patientRepository.save(patient);
//    System.out.println("Patient saved: " + savedPatient);

        String token = emailChanged ? jwtUtil.generateToken(updatedUser.getEmail(), updatedUser.getRole().name(), updatedUser.getId()) : null;

        return UpdatePatientResponse.builder()
                .id(updatedUser.getId())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .birthDate(updatedUser.getBirthDate())
                .gender(updatedUser.getGender().toString())
                .role(updatedUser.getRole().toString())
                .heightCm(savedPatient.getHeightCm())
                .weightKg(savedPatient.getWeightKg())
                .bloodType(savedPatient.getBloodType().toString()) // Return as string for consistency
                .createdAt(savedPatient.getCreatedAt())
                .updatedAt(savedPatient.getUpdatedAt())
                .token(token)
                .build();
    }
    private Patient.BloodType mapToBloodType(String bloodTypeStr) {
        if (bloodTypeStr == null) return Patient.BloodType.UNKNOWN;
        try {
            return Patient.BloodType.valueOf(bloodTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Fallback to UNKNOWN if the string doesn't match any enum value
            return Patient.BloodType.UNKNOWN;
        }
    }

}