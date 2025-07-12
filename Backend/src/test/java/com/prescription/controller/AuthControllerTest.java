//package com.prescription.controller;
//
//import com.prescription.dto.*;
//import com.prescription.entity.User;
//import com.prescription.service.UserService;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
//import jakarta.servlet.http.Cookie;
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
//import java.util.Optional;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyLong;
//import static org.mockito.Mockito.*;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@ExtendWith(MockitoExtension.class)
//class AuthControllerTest {
//
//    @Mock
//    private UserService userService;
//
//    @InjectMocks
//    private AuthController authController;
//
//    private MockMvc mockMvc;
//    private ObjectMapper objectMapper;
//
//    @BeforeEach
//    void setUp() {
//        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
//        objectMapper = new ObjectMapper();
//        // Register the JavaTimeModule to handle LocalDate and other Java 8 time types
//        objectMapper.registerModule(new JavaTimeModule());
//    }
//
//    @Test
//    void testLoginSuccess() throws Exception {
//        // Arrange
//        LoginRequest loginRequest = new LoginRequest();
//        loginRequest.setEmail("test@example.com");
//        loginRequest.setPassword("password123");
//
//        UserDto userDto = new UserDto(1L, "John Doe", "test@example.com", "PATIENT");
//        LoginResponse loginResponse = new LoginResponse("jwt-token-123", userDto);
//
//        when(userService.authenticate(any(LoginRequest.class))).thenReturn(loginResponse);
//
//        // Act & Assert
//        mockMvc.perform(post("/auth/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(loginRequest)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.token").value("jwt-token-123"))
//                .andExpect(jsonPath("$.type").value("Bearer"))
//                .andExpect(jsonPath("$.user.id").value(1L))
//                .andExpect(jsonPath("$.user.name").value("John Doe"))
//                .andExpect(jsonPath("$.user.email").value("test@example.com"))
//                .andExpect(jsonPath("$.user.role").value("PATIENT"))
//                .andExpect(cookie().value("jwt", "jwt-token-123"))
//                .andExpect(cookie().httpOnly("jwt", true))
//                .andExpect(cookie().path("jwt", "/"))
//                .andExpect(cookie().maxAge("jwt", 24 * 60 * 60));
//
//        verify(userService, times(1)).authenticate(any(LoginRequest.class));
//    }
//
//    @Test
//    void testLoginFailure() throws Exception {
//        // Arrange
//        LoginRequest loginRequest = new LoginRequest();
//        loginRequest.setEmail("test@example.com");
//        loginRequest.setPassword("wrongpassword");
//
//        when(userService.authenticate(any(LoginRequest.class)))
//                .thenThrow(new RuntimeException("Invalid credentials"));
//
//        // Act & Assert
//        mockMvc.perform(post("/auth/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(loginRequest)))
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.message").value("Invalid credentials"));
//
//        verify(userService, times(1)).authenticate(any(LoginRequest.class));
//    }
//
////    @Test
////    void testSignUpSuccess() throws Exception {
////        // Arrange
////        SignUpRequest signUpRequest = SignUpRequest.builder()
////                .name("John Doe")
////                .email("newuser@example.com")
////                .password("password123")
////                .phone("1234567890")
////                .role(User.Role.PATIENT)
////                .birthDate(LocalDate.of(1990, 1, 1))
////                .gender(User.Gender.MALE)
////                .build();
////
////        SignUpResponse signUpResponse = new SignUpResponse();
////        signUpResponse.setToken("jwt-token-456");
//////        signUpResponse.setMessage("User registered successfully");
////
////        when(userService.register(any(SignUpRequest.class))).thenReturn(signUpResponse);
////
////        // Act & Assert
////        mockMvc.perform(post("/auth/signup")
////                        .contentType(MediaType.APPLICATION_JSON)
////                        .content(objectMapper.writeValueAsString(signUpRequest)))
////                .andExpect(status().isCreated())
////                .andExpect(jsonPath("$.token").value("jwt-token-456"))
////                .andExpect(jsonPath("$.message").value("User registered successfully"))
////                .andExpect(cookie().value("jwt", "jwt-token-456"))
////                .andExpect(cookie().httpOnly("jwt", true));
////
////        verify(userService, times(1)).register(any(SignUpRequest.class));
////    }
//
//    @Test
//    void testSignUpFailure_EmailAlreadyExists() throws Exception {
//        // Arrange
//        SignUpRequest signUpRequest = SignUpRequest.builder()
//                .name("John Doe")
//                .email("existing@example.com")
//                .password("password123")
//                .phone("1234567890")
//                .role(User.Role.PATIENT)
//                .birthDate(LocalDate.of(1990, 1, 1))
//                .gender(User.Gender.MALE)
//                .build();
//
//        when(userService.register(any(SignUpRequest.class)))
//                .thenThrow(new RuntimeException("Email already in use"));
//
//        // Act & Assert
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signUpRequest)))
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.message").value("Email already in use"));
//
//        verify(userService, times(1)).register(any(SignUpRequest.class));
//    }
//
//    @Test
//    void testLogoutSuccess() throws Exception {
//        // Act & Assert
//        mockMvc.perform(post("/auth/logout"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.message").value("User logged out successfully!"))
//                .andExpect(cookie().value("jwt", ""))
//                .andExpect(cookie().maxAge("jwt", 0));
//
//        // Verify no service calls needed for logout
//        verifyNoInteractions(userService);
//    }
//
//    @Test
//    void testUpdateUserSuccess() throws Exception {
//        // Arrange
//        UpdateUserRequest updateRequest = new UpdateUserRequest();
//        updateRequest.setName("Updated John Doe");
//        updateRequest.setEmail("updated@example.com");
//        updateRequest.setPhone("9876543210");
//
//        User existingUser = new User();
//        existingUser.setId(1L);
//        existingUser.setEmail("test@example.com");
//
//        UpdateUserResponse updateResponse = UpdateUserResponse.builder()
//                .id(1L)
//                .name("Updated John Doe")
//                .email("updated@example.com")
//                .phone("9876543210")
//                .birthDate(LocalDate.of(1990, 1, 1))
//                .gender("MALE")
//                .role("PATIENT")
//                .token("new-jwt-token")
//                .build();
//
//        when(userService.getUserById(anyLong())).thenReturn(Optional.of(existingUser));
//        when(userService.updateUser(any(User.class), any(UpdateUserRequest.class)))
//                .thenReturn(updateResponse);
//
//        // Act & Assert
//        mockMvc.perform(put("/auth/update")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateRequest))
//                        .requestAttr("userId", 1L)) // Simulate JWT filter setting userId
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(1L))
//                .andExpect(jsonPath("$.name").value("Updated John Doe"))
//                .andExpect(jsonPath("$.email").value("updated@example.com"))
//                .andExpect(jsonPath("$.phone").value("9876543210"))
//                .andExpect(jsonPath("$.token").value("new-jwt-token"))
//                .andExpect(cookie().value("jwt", "new-jwt-token"));
//
//        verify(userService, times(1)).getUserById(1L);
//        verify(userService, times(1)).updateUser(any(User.class), any(UpdateUserRequest.class));
//    }
//
//    @Test
//    void testUpdateUserFailure_UserNotFound() throws Exception {
//        // Arrange
//        UpdateUserRequest updateRequest = new UpdateUserRequest();
//        updateRequest.setName("Updated John Doe");
//        updateRequest.setEmail("updated@example.com");
//
//        when(userService.getUserById(anyLong())).thenReturn(Optional.empty());
//
//        // Act & Assert
//        mockMvc.perform(put("/auth/update")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateRequest))
//                        .requestAttr("userId", 1L))
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.success").value(false))
//                .andExpect(jsonPath("$.message").value("Patient not found"));
//
//        verify(userService, times(1)).getUserById(1L);
//        verify(userService, never()).updateUser(any(User.class), any(UpdateUserRequest.class));
//    }
//
//    @Test
//    void testUpdateUserFailure_ServiceException() throws Exception {
//        // Arrange
//        UpdateUserRequest updateRequest = new UpdateUserRequest();
//        updateRequest.setName("Updated John Doe");
//        updateRequest.setEmail("updated@example.com");
//
//        User existingUser = new User();
//        existingUser.setId(1L);
//
//        when(userService.getUserById(anyLong())).thenReturn(Optional.of(existingUser));
//        when(userService.updateUser(any(User.class), any(UpdateUserRequest.class)))
//                .thenThrow(new RuntimeException("Update failed"));
//
//        // Act & Assert
//        mockMvc.perform(put("/auth/update")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateRequest))
//                        .requestAttr("userId", 1L))
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.message").value("Update failed"));
//
//        verify(userService, times(1)).getUserById(1L);
//        verify(userService, times(1)).updateUser(any(User.class), any(UpdateUserRequest.class));
//    }
//
//    @Test
//    void testUpdateUserSuccess_NoTokenInResponse() throws Exception {
//        // Arrange
//        UpdateUserRequest updateRequest = new UpdateUserRequest();
//        updateRequest.setName("Updated John Doe");
//        updateRequest.setEmail("updated@example.com");
//
//        User existingUser = new User();
//        existingUser.setId(1L);
//
//        UpdateUserResponse updateResponse = UpdateUserResponse.builder()
//                .id(1L)
//                .name("Updated John Doe")
//                .email("updated@example.com")
//                .phone("1234567890")
//                .birthDate(LocalDate.of(1990, 1, 1))
//                .gender("MALE")
//                .role("PATIENT")
//                .token(null) // No token in response
//                .build();
//
//        when(userService.getUserById(anyLong())).thenReturn(Optional.of(existingUser));
//        when(userService.updateUser(any(User.class), any(UpdateUserRequest.class)))
//                .thenReturn(updateResponse);
//
//        // Act & Assert
//        mockMvc.perform(put("/auth/update")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateRequest))
//                        .requestAttr("userId", 1L))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(1L))
//                .andExpect(jsonPath("$.name").value("Updated John Doe"))
//                .andExpect(jsonPath("$.email").value("updated@example.com"));
//
//        verify(userService, times(1)).getUserById(1L);
//        verify(userService, times(1)).updateUser(any(User.class), any(UpdateUserRequest.class));
//    }
//}
