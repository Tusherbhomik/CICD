package com.prescription.controller;

import com.fasterxml.jackson.databind.DatabindContext;
import com.prescription.entity.User;
import com.prescription.repository.UserRepository;
import com.prescription.service.FirebaseStorageService;
import com.prescription.service.UserService;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/users/profile")
@RequiredArgsConstructor
public class ProfileImageController {

    private final FirebaseStorageService firebaseStorageService;
    private final UserRepository userRepository;
    private final UserService userService;

    @PostMapping("/image/upload")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication,
            HttpServletRequest request2) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<User> optionalUser = userService.getUserById((Long) request2.getAttribute("userId"));
            if (optionalUser.isEmpty()) {
                response.put("success", false);
                response.put("message", "Patient not found");
                return ResponseEntity.badRequest().body(response);
            }
            User currentUser = optionalUser.get();
            // Get current user
//            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//            User currentUser = userRepository.findByEmail(userDetails.getUsername())
//                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Upload image to Firebase
            String imageUrl = firebaseStorageService.uploadProfileImage(file, currentUser.getId());

            // Update user profile image URL in database
            currentUser.setProfileImage(imageUrl);
            User updatedUser = userRepository.save(currentUser);

            // Prepare response
//            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile image uploaded successfully");
            response.put("imageUrl", imageUrl);
            response.put("userId", updatedUser.getId());

            log.info("Profile image uploaded successfully for user: {}", currentUser.getId());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Invalid file upload request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("Error uploading profile image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload profile image"));
        }
    }

    @DeleteMapping("/image")
    public ResponseEntity<?> deleteProfileImage(Authentication authentication, HttpServletRequest request2) {
        try {
            // Get current user
//            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//            User currentUser = userRepository.findByEmail(userDetails.getUsername())
//                    .orElseThrow(() -> new RuntimeException("User not found"));
            Map<String, Object> response = new HashMap<>();
            Optional<User> optionalUser = userService.getUserById((Long) request2.getAttribute("userId"));
            if (optionalUser.isEmpty()) {
                response.put("success", false);
                response.put("message", "Patient not found");
                return ResponseEntity.badRequest().body(response);
            }
            User currentUser = optionalUser.get();

            String currentImageUrl = currentUser.getProfileImage();

            if (currentImageUrl != null && !currentImageUrl.isEmpty()) {
                // Delete from Firebase Storage
                firebaseStorageService.deleteProfileImage(currentUser.getId(), currentImageUrl);

                // Update user profile image URL in database
                currentUser.setProfileImage(null);
                userRepository.save(currentUser);

                log.info("Profile image deleted successfully for user: {}", currentUser.getId());

                return ResponseEntity.ok(Map.of("message", "Profile image deleted successfully"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No profile image found to delete"));
            }

        } catch (Exception e) {
            log.error("Error deleting profile image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete profile image"));
        }
    }

    @GetMapping("/image")
    public ResponseEntity<?> getProfileImage(Authentication authentication, HttpServletRequest request2) {
        try {
            Map<String, Object> response = new HashMap<>();
            Optional<User> optionalUser = userService.getUserById((Long) request2.getAttribute("userId"));
            if (optionalUser.isEmpty()) {
                response.put("success", false);
                response.put("message", "Patient not found");
                return ResponseEntity.badRequest().body(response);
            }
            User currentUser = optionalUser.get();
            // Get current user
//            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//            User currentUser = userRepository.findByEmail(userDetails.getUsername())
//                    .orElseThrow(() -> new RuntimeException("User not found"));

//            Map<String, Object> response = new HashMap<>();
            response.put("imageUrl", currentUser.getProfileImage());
            response.put("hasImage", currentUser.getProfileImage() != null);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting profile image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get profile image"));
        }
    }

    @PutMapping("/image/update")
    public ResponseEntity<?> updateProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication,
            HttpServletRequest request2) {

        try {
            Map<String, Object> response = new HashMap<>();
            Optional<User> optionalUser = userService.getUserById((Long) request2.getAttribute("userId"));
            if (optionalUser.isEmpty()) {
                response.put("success", false);
                response.put("message", "Patient not found");
                return ResponseEntity.badRequest().body(response);
            }
            User currentUser = optionalUser.get();
            // Get current user
//            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//            User currentUser = userRepository.findByEmail(userDetails.getUsername())
//                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Delete existing image if any
            if (currentUser.getProfileImage() != null && !currentUser.getProfileImage().isEmpty()) {
                firebaseStorageService.deleteProfileImage(currentUser.getId(), currentUser.getProfileImage());
            }

            // Upload new image
            String imageUrl = firebaseStorageService.uploadProfileImage(file, currentUser.getId());

            // Update user profile image URL in database
            currentUser.setProfileImage(imageUrl);
            User updatedUser = userRepository.save(currentUser);

            // Prepare response
//            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile image updated successfully");
            response.put("imageUrl", imageUrl);
            response.put("userId", updatedUser.getId());

            log.info("Profile image updated successfully for user: {}", currentUser.getId());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Invalid file update request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("Error updating profile image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile image"));
        }
    }
}
