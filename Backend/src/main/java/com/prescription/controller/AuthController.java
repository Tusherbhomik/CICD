package com.prescription.controller;

import com.prescription.dto.LoginRequest;
import com.prescription.dto.LoginResponse;
import com.prescription.dto.SignUpRequest;
import com.prescription.dto.SignUpResponse;
import com.prescription.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            // UserService should:
            // 1) validate unique email
            // 2) hash the password
            // 3) save the user
            // 4) generate JWT (optional but handy for auto-login)
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