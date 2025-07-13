package com.prescription.controller;

import com.prescription.dto.admin.*;
import com.prescription.entity.Admin;
import com.prescription.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    // ============ AUTHENTICATION ENDPOINTS ============

    /**
     * Admin Login
     * POST /api/admin/login
     */
    @GetMapping("/tusher")
    public String tusher() {
        System.out.println("I am Tusher");
        return "Check console for message";
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AdminLoginRequestDTO request,
                                   HttpServletRequest httpRequest) {
        try {
            log.info("Admin login request received for email: {}", request.getEmail());

            AdminLoginResponseDTO response = adminService.login(request);

            // Log successful login with IP address
            String clientIp = getClientIpAddress(httpRequest);
            log.info("Admin login successful - Email: {}, IP: {}, Admin Level: {}",
                    request.getEmail(), clientIp, response.getAdmin().getAdminLevel());

            return ResponseEntity.ok(response);

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
     * Admin Signup/Registration
     * POST /api/admin/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody AdminSignupRequestDTO request,
                                    HttpServletRequest httpRequest,
                                    @RequestHeader(value = "X-Created-By-Admin-Id", required = false) Long createdByAdminId) {
        try {
            System.out.println(request);
            log.info("Admin signup request received for email: {}", request.getEmail());

            // For first admin, createdByAdminId will be null
            AdminSignupResponseDTO response = adminService.signup(request, createdByAdminId);

            // Determine response status based on whether approval is required
            HttpStatus status = response.isRequiresApproval() ? HttpStatus.ACCEPTED : HttpStatus.CREATED;

            log.info("Admin signup successful - Email: {}, Requires Approval: {}",
                    request.getEmail(), response.isRequiresApproval());

            return ResponseEntity.status(status).body(response);

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
     * Admin Logout
     * POST /api/admin/logout
     */
    @PostMapping("/logout")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // If using sessions, invalidate the session
        // If using JWT, add token to blacklist (implementation depends on your JWT strategy)

        log.info("Admin logout request received");

        return ResponseEntity.ok().body(new AdminLoginResponseDTO(
                "Logout successful", null, null, LocalDateTime.now()));
    }

    // ============ ADMIN MANAGEMENT ENDPOINTS ============

    /**
     * Get All Admins
     * GET /api/admin/list
     */
    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAdmins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader("X-Admin-Id") Long requestingAdminId,
            HttpServletRequest httpRequest) {

        try {
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminById(@PathVariable Long id,
                                          @RequestHeader("X-Admin-Id") Long requestingAdminId,
                                          HttpServletRequest httpRequest) {
        try {
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
     * Approve Pending Admin
     * PUT /api/admin/{id}/approve
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ROOT_ADMIN')")
    public ResponseEntity<?> approveAdmin(@PathVariable Long id,
                                          @RequestHeader("X-Admin-Id") Long approvingAdminId,
                                          HttpServletRequest httpRequest) {
        try {
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
                                          @RequestHeader("X-Admin-Id") Long suspendingAdminId,
                                          HttpServletRequest httpRequest) {
        try {
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id,
                                         @Valid @RequestBody AdminUpdateRequestDTO request,
                                         @RequestHeader("X-Admin-Id") Long updatingAdminId,
                                         HttpServletRequest httpRequest) {
        try {
            Admin updatedAdmin = adminService.updateAdmin(id, request, updatingAdminId);
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changePassword(@PathVariable Long id,
                                            @Valid @RequestBody AdminPasswordChangeRequestDTO request,
                                            @RequestHeader("X-Admin-Id") Long requestingAdminId,
                                            HttpServletRequest httpRequest) {
        try {
            // Only allow password change for own account
            if (!id.equals(requestingAdminId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AdminErrorResponseDTO("ACCESS_DENIED",
                                "You can only change your own password",
                                HttpStatus.FORBIDDEN.value()));
            }

            adminService.changePassword(id, request);

            return ResponseEntity.ok().body(new AdminSignupResponseDTO(
                    "Password changed successfully", null, LocalDateTime.now(), false));

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
     * Get Pending Approval Admins
     * GET /api/admin/pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ROOT_ADMIN')")
    public ResponseEntity<?> getPendingApprovalAdmins() {
        try {
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AdminErrorResponseDTO("FETCH_FAILED", e.getMessage(),
                            HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

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