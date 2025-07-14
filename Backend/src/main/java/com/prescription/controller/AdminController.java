package com.prescription.controller;

import com.prescription.dto.admin.*;
import com.prescription.entity.Admin;
import com.prescription.service.AdminService;
import com.prescription.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    private final AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    // ============ AUTHENTICATION ENDPOINTS ============

    /**
     * Test endpoint
     */
    @GetMapping("/tusher")
    public String tusher() {
        System.out.println("I am Tusher");
        return "Check console for message";
    }

    /**
     * Admin Signup/Registration
     * POST /api/admin/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody AdminSignupRequestDTO request,
                                    HttpServletRequest httpRequest,
                                    HttpServletResponse response,
                                    @RequestHeader(value = "X-Created-By-Admin-Id", required = false) Long createdByAdminId) {
        try {
            log.info("Admin signup request received for email: {}", request.getEmail());

            // Register admin
            AdminSignupResponseDTO signupResponse = adminService.signup(request, createdByAdminId);

            String jwtRole = "N/A"; // Default value for logging

            // Generate JWT token for newly created admin (if active)
            if (!signupResponse.isRequiresApproval()) {
                Admin admin = adminService.getAdminByEmail(request.getEmail());

                // ✅ FIX: Use actual admin level from database
                jwtRole = admin.getAdminLevel().name(); // "ROOT_ADMIN" or "ADMIN"

                String jwtToken = jwtUtil.generateToken(
                        admin.getEmail(),
                        jwtRole,  // ✅ Dynamic role instead of hardcoded "ADMIN"
                        admin.getId()
                );

                // Set JWT token in response
                signupResponse.setToken(jwtToken);

                // Set JWT token in HTTP-only cookie
                Cookie jwtCookie = new Cookie("adminJwt", jwtToken);
                jwtCookie.setHttpOnly(true);
                jwtCookie.setSecure(false);
                jwtCookie.setPath("/");
                jwtCookie.setMaxAge(24 * 60 * 60);
                response.addCookie(jwtCookie);
            }

            HttpStatus status = signupResponse.isRequiresApproval() ? HttpStatus.ACCEPTED : HttpStatus.CREATED;

            log.info("Admin signup successful - Email: {}, Requires Approval: {}, Role: {}",
                    request.getEmail(), signupResponse.isRequiresApproval(), jwtRole);

            return ResponseEntity.status(status).body(signupResponse);

        } catch (Exception e) {
            log.error("Admin signup failed for email: {} - Error: {}", request.getEmail(), e.getMessage());

            AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                    "SIGNUP_FAILED",
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST.value()
            );
            errorResponse.setPath(httpRequest.getRequestURI());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Admin Login
     * POST /api/admin/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AdminLoginRequestDTO request,
                                   HttpServletRequest httpRequest,
                                   HttpServletResponse response) {
        try {
            log.info("Admin login request received for email: {}", request.getEmail());

            // Authenticate admin
            AdminLoginResponseDTO loginResponse = adminService.login(request);

            // Get admin details
            Admin admin = adminService.getAdminByEmail(request.getEmail());

            // ✅ FIX: Use actual admin level from database
            String jwtRole = admin.getAdminLevel().name(); // "ROOT_ADMIN" or "ADMIN"

            String jwtToken = jwtUtil.generateToken(
                    admin.getEmail(),
                    jwtRole,  // ✅ Dynamic role instead of hardcoded "ADMIN"
                    admin.getId()
            );

            // Set JWT token in response
            loginResponse.setToken(jwtToken);

            // Set JWT token in HTTP-only cookie
            Cookie jwtCookie = new Cookie("adminJwt", jwtToken);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(24 * 60 * 60);
            response.addCookie(jwtCookie);

            // Log successful login
            String clientIp = getClientIpAddress(httpRequest);
            log.info("Admin login successful - Email: {}, IP: {}, Admin Level: {}, JWT Role: {}",
                    request.getEmail(), clientIp, admin.getAdminLevel(), jwtRole);

            return ResponseEntity.ok(loginResponse);

        } catch (Exception e) {
            log.error("Admin login failed for email: {} - Error: {}", request.getEmail(), e.getMessage());

            AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                    "LOGIN_FAILED",
                    e.getMessage(),
                    HttpStatus.UNAUTHORIZED.value()
            );
            errorResponse.setPath(httpRequest.getRequestURI());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    /**
     * Admin Logout
     * POST /api/admin/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        try {
            log.info("Admin logout request received");

            // Clear JWT cookie
            Cookie jwtCookie = new Cookie("adminJwt", "");
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false); // Set to true in production with HTTPS
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(0); // Expire immediately
            response.addCookie(jwtCookie);

            return ResponseEntity.ok().body(new MessageResponse("Admin logged out successfully!"));

        } catch (Exception e) {
            log.error("Admin logout failed - Error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Logout failed: " + e.getMessage()));
        }
    }

    // ============ ADMIN MANAGEMENT ENDPOINTS ============

    /**
     * Get All Admins
     * GET /api/admin/list
     */
    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<?> getAllAdmins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            HttpServletRequest httpRequest) {

        try {
            // Get admin ID from JWT token
            Long requestingAdminId = (Long) httpRequest.getAttribute("userId");

            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ?
                    Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            AdminListResponseDTO response = adminService.getAllAdmins(pageable, requestingAdminId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to get admin list - Error: {}", e.getMessage());

            AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                    "FETCH_FAILED",
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value()
            );
            errorResponse.setPath(httpRequest.getRequestURI());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get Admin by ID
     * GET /api/admin/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<?> getAdminById(@PathVariable Long id,
                                          HttpServletRequest httpRequest) {
        try {
            // Get admin ID from JWT token
            Long requestingAdminId = (Long) httpRequest.getAttribute("userId");

            // Check if requesting admin can view this admin
            if (!adminService.canManageAdmin(requestingAdminId, id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AdminErrorResponseDTO("ACCESS_DENIED",
                                "You don't have permission to view this admin",
                                HttpStatus.FORBIDDEN.value()));
            }

            Admin admin = adminService.getAdminById(id);
            AdminLoginResponseDTO.AdminInfo adminInfo = new AdminLoginResponseDTO.AdminInfo(admin);

            return ResponseEntity.ok(adminInfo);

        } catch (Exception e) {
            log.error("Failed to get admin by ID: {} - Error: {}", id, e.getMessage());

            AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                    "ADMIN_NOT_FOUND",
                    e.getMessage(),
                    HttpStatus.NOT_FOUND.value()
            );
            errorResponse.setPath(httpRequest.getRequestURI());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Get Pending Approval Admins
     * GET /api/admin/pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ROOT_ADMIN')")
    public ResponseEntity<?> getPendingApprovalAdmins(HttpServletRequest httpRequest) {
        try {
            System.out.println("Hit this pending api end point");
            // Get admin ID from JWT token
            Long requestingAdminId = (Long) httpRequest.getAttribute("userId");

            log.info("Fetching pending admins by admin ID: {}", requestingAdminId);

            // Double-check that the requesting admin has ROOT_ADMIN privileges
            Admin requestingAdmin = adminService.getAdminById(requestingAdminId);
            if (!requestingAdmin.getAdminLevel().equals(Admin.AdminLevel.ROOT_ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AdminErrorResponseDTO("ACCESS_DENIED",
                                "Only ROOT_ADMIN can view pending approvals",
                                HttpStatus.FORBIDDEN.value()));
            }

            List<Admin> pendingAdmins = adminService.getPendingApprovalAdmins();

            List<AdminListResponseDTO.AdminSummary> pendingSummaries = pendingAdmins.stream()
                    .map(admin -> new AdminListResponseDTO.AdminSummary(admin, "System"))
                    .toList();

            AdminListResponseDTO response = new AdminListResponseDTO();
            response.setMessage("Pending approval admins retrieved successfully");
            response.setAdmins(pendingSummaries);
            response.setTotalCount(pendingSummaries.size());
            response.setHasMoreData(false);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to get pending approval admins - Error: {}", e.getMessage());

            AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                    "FETCH_FAILED",
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value()
            );
            errorResponse.setPath(httpRequest.getRequestURI());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Approve Pending Admin
     * PUT /api/admin/{id}/approve
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ROOT_ADMIN')")
    public ResponseEntity<?> approveAdmin(@PathVariable Long id,
                                          HttpServletRequest httpRequest) {
        try {
            // Get admin ID from JWT token
            Long approvingAdminId = (Long) httpRequest.getAttribute("userId");

            // Double-check ROOT_ADMIN privileges
            Admin approvingAdmin = adminService.getAdminById(approvingAdminId);
            if (!approvingAdmin.getAdminLevel().equals(Admin.AdminLevel.ROOT_ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AdminErrorResponseDTO("ACCESS_DENIED",
                                "Only ROOT_ADMIN can approve admins",
                                HttpStatus.FORBIDDEN.value()));
            }

            adminService.approveAdmin(id, approvingAdminId);

            return ResponseEntity.ok().body(new AdminSignupResponseDTO(
                    "Admin approved successfully", null, LocalDateTime.now(), false));

        } catch (Exception e) {
            log.error("Failed to approve admin ID: {} - Error: {}", id, e.getMessage());

            AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                    "APPROVAL_FAILED",
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST.value()
            );
            errorResponse.setPath(httpRequest.getRequestURI());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Suspend Admin
     * PUT /api/admin/{id}/suspend
     */
    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ROOT_ADMIN')")
    public ResponseEntity<?> suspendAdmin(@PathVariable Long id,
                                          HttpServletRequest httpRequest) {
        try {
            // Get admin ID from JWT token
            Long suspendingAdminId = (Long) httpRequest.getAttribute("userId");

            // Double-check ROOT_ADMIN privileges
            Admin suspendingAdmin = adminService.getAdminById(suspendingAdminId);
            if (!suspendingAdmin.getAdminLevel().equals(Admin.AdminLevel.ROOT_ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AdminErrorResponseDTO("ACCESS_DENIED",
                                "Only ROOT_ADMIN can suspend admins",
                                HttpStatus.FORBIDDEN.value()));
            }

            adminService.suspendAdmin(id, suspendingAdminId);

            return ResponseEntity.ok().body(new AdminSignupResponseDTO(
                    "Admin suspended successfully", null, LocalDateTime.now(), false));

        } catch (Exception e) {
            log.error("Failed to suspend admin ID: {} - Error: {}", id, e.getMessage());

            AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                    "SUSPENSION_FAILED",
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST.value()
            );
            errorResponse.setPath(httpRequest.getRequestURI());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Update Admin
     * PUT /api/admin/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id,
                                         @Valid @RequestBody AdminUpdateRequestDTO request,
                                         HttpServletRequest httpRequest,
                                         HttpServletResponse response) {
        try {
            // Get admin ID from JWT token
            Long updatingAdminId = (Long) httpRequest.getAttribute("userId");

            Admin updatedAdmin = adminService.updateAdmin(id, request, updatingAdminId);

            // If email was changed, generate new JWT token with correct role
            if (request.getEmail() != null && !request.getEmail().equals(updatedAdmin.getEmail())) {
                // ✅ FIX: Use actual admin level instead of hardcoded "ADMIN"
                String jwtRole = updatedAdmin.getAdminLevel().name();

                String newToken = jwtUtil.generateToken(
                        updatedAdmin.getEmail(),
                        jwtRole,  // ✅ Dynamic role instead of hardcoded "ADMIN"
                        updatedAdmin.getId()
                );

                // Update cookie with new token
                Cookie jwtCookie = new Cookie("adminJwt", newToken);
                jwtCookie.setHttpOnly(true);
                jwtCookie.setSecure(false);
                jwtCookie.setPath("/");
                jwtCookie.setMaxAge(24 * 60 * 60);
                response.addCookie(jwtCookie);
            }

            AdminLoginResponseDTO.AdminInfo adminInfo = new AdminLoginResponseDTO.AdminInfo(updatedAdmin);

            return ResponseEntity.ok(adminInfo);

        } catch (Exception e) {
            log.error("Failed to update admin ID: {} - Error: {}", id, e.getMessage());

            AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                    "UPDATE_FAILED",
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST.value()
            );
            errorResponse.setPath(httpRequest.getRequestURI());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Change Password
     * PUT /api/admin/{id}/password
     */
    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<?> changePassword(@PathVariable Long id,
                                            @Valid @RequestBody AdminPasswordChangeRequestDTO request,
                                            HttpServletRequest httpRequest) {
        try {
            // Get admin ID from JWT token
            Long requestingAdminId = (Long) httpRequest.getAttribute("userId");

            // Only allow password change for own account
            if (!id.equals(requestingAdminId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AdminErrorResponseDTO("ACCESS_DENIED",
                                "You can only change your own password",
                                HttpStatus.FORBIDDEN.value()));
            }

            adminService.changePassword(id, request);

            return ResponseEntity.ok().body(new MessageResponse("Password changed successfully"));

        } catch (Exception e) {
            log.error("Failed to change password for admin ID: {} - Error: {}", id, e.getMessage());

            AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                    "PASSWORD_CHANGE_FAILED",
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST.value()
            );
            errorResponse.setPath(httpRequest.getRequestURI());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ============ UTILITY ENDPOINTS ============

    /**
     * Check if ROOT_ADMIN exists
     * GET /api/admin/root-exists
     */
    @GetMapping("/root-exists")
    public ResponseEntity<Boolean> rootAdminExists() {
        boolean exists = adminService.rootAdminExists();
        log.info("ROOT_ADMIN exists check: {}", exists);
        return ResponseEntity.ok(exists);
    }

    // ============ HELPER METHODS ============

    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    // ============ HELPER CLASSES ============

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

    // ============ EXCEPTION HANDLER ============

    /**
     * Handle validation errors
     */
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<AdminErrorResponseDTO> handleValidationException(
            org.springframework.web.bind.MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((msg1, msg2) -> msg1 + "; " + msg2)
                .orElse("Validation failed");

        AdminErrorResponseDTO errorResponse = new AdminErrorResponseDTO(
                "VALIDATION_ERROR",
                errorMessage,
                HttpStatus.BAD_REQUEST.value()
        );
        errorResponse.setPath(request.getRequestURI());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
}