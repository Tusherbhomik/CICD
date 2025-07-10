package com.prescription.controller;

import com.prescription.dto.*;
import com.prescription.entity.User;
import com.prescription.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private UserService userService;



    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
                                              HttpServletResponse response) {
        try {
            LoginResponse loginResponse = userService.authenticate(loginRequest);

            // Set JWT token in HTTP-only cookie
            Cookie jwtCookie = new Cookie("jwt", loginResponse.getToken());
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false); // Set to true in production with HTTPS
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(24 * 60 * 60); // 24 hours
            response.addCookie(jwtCookie);

            return ResponseEntity.ok(loginResponse);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }



    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest,
                                          HttpServletResponse response) {
        try {
            SignUpResponse signUpResponse = userService.register(signUpRequest);

            // (Optional) immediately log the user in by dropping a JWT cookie
            Cookie jwtCookie = new Cookie("jwt", signUpResponse.getToken());
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false);      // true in prod (HTTPS)
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(24 * 60 * 60);
            response.addCookie(jwtCookie);

            return ResponseEntity.status(201).body(signUpResponse);

        } catch (RuntimeException ex) {
            // e.g. “Email already in use” or validation failure thrown by service
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(ex.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        // Clear JWT cookie
        Cookie jwtCookie = new Cookie("jwt", "");
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Set to true in production with HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Expire immediately
        response.addCookie(jwtCookie);

        return ResponseEntity.ok(new MessageResponse("User logged out successfully!"));
    }

    @PutMapping("/doctor-update")
    public ResponseEntity<?> updateDoctor(
            @Valid @RequestBody UpdateDoctorRequest updateDoctorRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            System.out.println("Received UpdateUserRequest: " + updateDoctorRequest);
            Map<String, Object> response2 = new HashMap<>();
            Optional<User> optionalUser = userService.getUserById((Long) request.getAttribute("userId"));
            if (optionalUser.isEmpty()) {
                response2.put("success", false);
                response2.put("message", "user not found");
                return ResponseEntity.badRequest().body(response2);
            }

            UpdateDoctorResponse updateDoctorResponse = userService.updateDoctorUser(optionalUser.get(), updateDoctorRequest);
            System.out.println("Received UpdateUserResponse: " + updateDoctorResponse);

            // Update JWT cookie if token is provided (optional)
            if (updateDoctorResponse.getToken() != null) {
                Cookie jwtCookie = new Cookie("jwt", updateDoctorResponse.getToken());
                jwtCookie.setHttpOnly(true);
                jwtCookie.setSecure(false); // true in prod (HTTPS)
                jwtCookie.setPath("/");
                jwtCookie.setMaxAge(24 * 60 * 60);
                response.addCookie(jwtCookie);
            }

            return ResponseEntity.ok(updateDoctorResponse);

        } catch (RuntimeException ex) {
            // e.g., "User not found" or validation failure
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(ex.getMessage()));
        }
    }



    @PutMapping("/patient-update")
    public ResponseEntity<?> updatePatient(
            @Valid @RequestBody UpdatePatientRequest updatePatientRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            System.out.println("Received UpdatePatientRequest: " + updatePatientRequest);
            Map<String, Object> response2 = new HashMap<>();
            Optional<User> optionalUser = userService.getUserById((Long) request.getAttribute("userId"));
            if (optionalUser.isEmpty()) {
                response2.put("success", false);
                response2.put("message", "user not found");
                return ResponseEntity.badRequest().body(response2);
            }

            UpdatePatientResponse updatePatientResponse = userService.updatePatientUser(optionalUser.get(), updatePatientRequest);
            System.out.println("Received UpdateUserResponse: " + updatePatientResponse);

            // Update JWT cookie if token is provided (optional)
            if (updatePatientResponse.getToken() != null) {
                Cookie jwtCookie = new Cookie("jwt", updatePatientResponse.getToken());
                jwtCookie.setHttpOnly(true);
                jwtCookie.setSecure(false); // true in prod (HTTPS)
                jwtCookie.setPath("/");
                jwtCookie.setMaxAge(24 * 60 * 60);
                response.addCookie(jwtCookie);
            }

            return ResponseEntity.ok(updatePatientResponse);

        } catch (RuntimeException ex) {
            // e.g., "User not found" or validation failure
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(ex.getMessage()));
        }
    }

    // Helper classes for responses
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}