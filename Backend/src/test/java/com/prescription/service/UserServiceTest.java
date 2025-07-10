package com.prescription.service;

import com.prescription.dto.*;
import com.prescription.entity.Patient;
import com.prescription.entity.User;
import com.prescription.repository.PatientRepository;
import com.prescription.repository.UserRepository;
import com.prescription.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
@ActiveProfiles("test")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private Patient testPatient;
    private LoginRequest loginRequest;
    private SignUpRequest signUpRequest;

    @BeforeEach
    void setUp() {
        // Create test user using your actual User entity structure
        testUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .passwordHash("hashedPassword")
                .phone("1234567890")
                .role(User.Role.PATIENT)
                .profileImage("profile.jpg")
                .isVerified(true)
                .lastLogin(LocalDateTime.now())
                .birthDate(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.MALE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Create test patient using your actual Patient entity structure
        testPatient = new Patient(testUser);
        testPatient.setHeightCm(new BigDecimal("180.0"));
        testPatient.setWeightKg(new BigDecimal("75.5"));
        testPatient.setBloodType(Patient.BloodType.O_POSITIVE);
        testPatient.setCreatedAt(LocalDateTime.now());
        testPatient.setUpdatedAt(LocalDateTime.now());

        // Create test requests
        loginRequest = new LoginRequest("john@example.com", "password123");

        signUpRequest = SignUpRequest.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .password("password123")
                .phone("0987654321")
                .role(User.Role.PATIENT)
                .birthDate(LocalDate.of(1985, 5, 15))
                .gender(User.Gender.FEMALE)
                .build();
    }

    @Test
    void authenticate_Success() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken(testUser.getEmail(), testUser.getRole().name(), testUser.getId())).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        LoginResponse response = userService.authenticate(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertNotNull(response.getUser());
        assertEquals(testUser.getId(), response.getUser().getId());
        assertEquals(testUser.getName(), response.getUser().getName());
        assertEquals(testUser.getEmail(), response.getUser().getEmail());

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPasswordHash());
        verify(jwtUtil).generateToken(testUser.getEmail(), testUser.getRole().name(), testUser.getId());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void authenticate_UserNotFound() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.authenticate(loginRequest));

        assertEquals("User not found with email: " + loginRequest.getEmail(), exception.getMessage());
        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtUtil, never()).generateToken(anyString(), anyString(), anyLong());
    }

    @Test
    void authenticate_InvalidPassword() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPasswordHash())).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.authenticate(loginRequest));

        assertEquals("Invalid password", exception.getMessage());
        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPasswordHash());
        verify(jwtUtil, never()).generateToken(anyString(), anyString(), anyLong());
    }

    @Test
    void register_Success() {
        // Arrange
        User newUser = User.builder()
                .id(2L)
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .passwordHash("encodedPassword")
                .phone(signUpRequest.getPhone())
                .role(signUpRequest.getRole())
                .birthDate(signUpRequest.getBirthDate())
                .gender(signUpRequest.getGender())
                .isVerified(false)
                .build();

        when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(signUpRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        when(jwtUtil.generateToken(newUser.getEmail(), newUser.getRole().name(), newUser.getId())).thenReturn("jwt-token");

        // Act
        SignUpResponse response = userService.register(signUpRequest);

        // Assert
        assertNotNull(response);
        assertEquals(newUser.getId(), response.getId());
        assertEquals(newUser.getName(), response.getName());
        assertEquals(newUser.getEmail(), response.getEmail());
        assertEquals(newUser.getRole(), response.getRole());
        assertEquals("jwt-token", response.getToken());

        verify(userRepository).existsByEmail(signUpRequest.getEmail());
        verify(passwordEncoder).encode(signUpRequest.getPassword());
        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateToken(newUser.getEmail(), newUser.getRole().name(), newUser.getId());
    }

    @Test
    void register_EmailAlreadyExists() {
        // Arrange
        when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.register(signUpRequest));

        assertEquals("Email already exists: " + signUpRequest.getEmail(), exception.getMessage());
        verify(userRepository).existsByEmail(signUpRequest.getEmail());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(jwtUtil, never()).generateToken(anyString(), anyString(), anyLong());
    }

    @Test
    void createUser_Success() {
        // Arrange
        User newUser = User.builder()
                .email("test@example.com")
                .passwordHash("plainPassword")
                .name("Test User")
                .role(User.Role.PATIENT)
                .birthDate(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.MALE)
                .build();

        User savedUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .passwordHash("encodedPassword")
                .name("Test User")
                .role(User.Role.PATIENT)
                .birthDate(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.MALE)
                .build();

        when(userRepository.existsByEmail(newUser.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(newUser.getPasswordHash())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        User result = userService.createUser(newUser);

        // Assert
        assertNotNull(result);
        assertEquals(savedUser.getId(), result.getId());
        assertEquals(savedUser.getEmail(), result.getEmail());
        assertEquals("encodedPassword", newUser.getPasswordHash());

        verify(userRepository).existsByEmail(newUser.getEmail());
        verify(passwordEncoder).encode("plainPassword");
        verify(userRepository).save(newUser);
    }

    @Test
    void createUser_EmailAlreadyExists() {
        // Arrange
        User newUser = User.builder()
                .email("existing@example.com")
                .passwordHash("password")
                .name("Test User")
                .role(User.Role.PATIENT)
                .birthDate(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.MALE)
                .build();

        when(userRepository.existsByEmail(newUser.getEmail())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.createUser(newUser));

        assertEquals("Email already exists: " + newUser.getEmail(), exception.getMessage());
        verify(userRepository).existsByEmail(newUser.getEmail());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUserById_Found() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.getUserById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser.getId(), result.get().getId());
        assertEquals(testUser.getEmail(), result.get().getEmail());
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserById_NotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Optional<User> result = userService.getUserById(1L);

        // Assert
        assertTrue(result.isEmpty());
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserByEmail_Found() {
        // Arrange
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.getUserByEmail("john@example.com");

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser.getId(), result.get().getId());
        assertEquals(testUser.getEmail(), result.get().getEmail());
        verify(userRepository).findByEmail("john@example.com");
    }

    @Test
    void getUserByEmail_NotFound() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act
        Optional<User> result = userService.getUserByEmail("nonexistent@example.com");

        // Assert
        assertTrue(result.isEmpty());
        verify(userRepository).findByEmail("nonexistent@example.com");
    }

    @Test
    void convertToDto_Success() {
        // Act
        UserDto result = userService.convertToDto(testUser);

        // Assert
        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getName(), result.getName());
        assertEquals(testUser.getEmail(), result.getEmail());
        assertEquals(testUser.getPhone(), result.getPhone());
        assertEquals(testUser.getRole().name(), result.getRole());
        assertEquals(testUser.getBirthDate(), result.getBirthDate());
        assertEquals(testUser.getGender().name(), result.getGender());
    }

    @Test
    void getAllPatients_Success() {
        // Arrange
        User patient1 = User.builder()
                .id(1L)
                .name("Patient 1")
                .email("patient1@example.com")
                .role(User.Role.PATIENT)
                .birthDate(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.MALE)
                .build();

        User patient2 = User.builder()
                .id(2L)
                .name("Patient 2")
                .email("patient2@example.com")
                .role(User.Role.PATIENT)
                .birthDate(LocalDate.of(1985, 5, 15))
                .gender(User.Gender.FEMALE)
                .build();

        List<User> patients = Arrays.asList(patient1, patient2);
        when(userRepository.findAllPatients()).thenReturn(patients);

        // Act
        List<UserDto> result = userService.getAllPatients();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Patient 1", result.get(0).getName());
        assertEquals("Patient 2", result.get(1).getName());
        assertEquals("PATIENT", result.get(0).getRole());
        assertEquals("PATIENT", result.get(1).getRole());
        verify(userRepository).findAllPatients();
    }

    @Test
    void getAllPatients_EmptyList() {
        // Arrange
        when(userRepository.findAllPatients()).thenReturn(Arrays.asList());

        // Act
        List<UserDto> result = userService.getAllPatients();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(userRepository).findAllPatients();
    }

    @Test
    void getPatientById_Success() {
        // Arrange
        when(patientRepository.findByUserId(1L)).thenReturn(Optional.of(testPatient));

        // Act
        PatientResponse result = userService.getPatientById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getName(), result.getName());
        assertEquals(testUser.getEmail(), result.getEmail());
        assertEquals(testUser.getPhone(), result.getPhone());
        assertEquals(testUser.getBirthDate(), result.getBirthDate());
        assertEquals(testUser.getGender(), result.getGender());
        assertEquals(testUser.getProfileImage(), result.getProfileImage());
        assertEquals(testUser.getIsVerified(), result.getIsVerified());
        assertEquals(testUser.getLastLogin(), result.getLastLogin());
        assertEquals(testUser.getCreatedAt(), result.getCreatedAt());

        // Patient specific fields
        assertEquals(testPatient.getHeightCm().intValue(), result.getHeightCm().intValue());
        assertEquals(testPatient.getWeightKg(), result.getWeightKg());
        assertEquals(testPatient.getBloodType(), result.getBloodType());
        assertEquals(testPatient.getCreatedAt(), result.getPatientCreatedAt());
        assertEquals(testPatient.getUpdatedAt(), result.getPatientUpdatedAt());

        verify(patientRepository).findByUserId(1L);
    }

    @Test
    void getPatientById_NotFound() {
        // Arrange
        when(patientRepository.findByUserId(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.getPatientById(1L));

        assertEquals("Patient not found with id: 1", exception.getMessage());
        verify(patientRepository).findByUserId(1L);
    }

    @Test
    void convertToDto_WithNullValues() {
        // Arrange
        User userWithNulls = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .role(User.Role.PATIENT)
                .birthDate(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.MALE)
                // phone is null
                .build();

        // Act
        UserDto result = userService.convertToDto(userWithNulls);

        // Assert
        assertNotNull(result);
        assertEquals(userWithNulls.getId(), result.getId());
        assertEquals(userWithNulls.getName(), result.getName());
        assertEquals(userWithNulls.getEmail(), result.getEmail());
        assertNull(result.getPhone());
        assertEquals(userWithNulls.getBirthDate(), result.getBirthDate());
        assertEquals(userWithNulls.getRole().name(), result.getRole());
        assertEquals(userWithNulls.getGender().name(), result.getGender());
    }

    @Test
    void authenticate_UpdatesLastLogin() {
        // Arrange
        LocalDateTime originalLastLogin = testUser.getLastLogin();
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString(), anyLong())).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        userService.authenticate(loginRequest);

        // Assert
        verify(userRepository).save(argThat(user ->
                user.getLastLogin() != null && user.getLastLogin().isAfter(originalLastLogin)
        ));
    }

    @Test
    void register_SetsDefaultValues() {
        // Arrange
        User newUser = User.builder()
                .id(2L)
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .passwordHash("encodedPassword")
                .phone(signUpRequest.getPhone())
                .role(signUpRequest.getRole())
                .birthDate(signUpRequest.getBirthDate())
                .gender(signUpRequest.getGender())
                .isVerified(false)
                .build();

        when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(signUpRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        when(jwtUtil.generateToken(anyString(), anyString(), anyLong())).thenReturn("jwt-token");

        // Act
        SignUpResponse response = userService.register(signUpRequest);

        // Assert
        verify(userRepository).save(argThat(user ->
                user.getIsVerified() == false
        ));
    }
}