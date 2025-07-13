package com.prescription.service;

import com.prescription.dto.admin.*;
import com.prescription.entity.Admin;
import com.prescription.exception.AdminException;
import com.prescription.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    // Constants for security
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int ACCOUNT_LOCK_DURATION_HOURS = 2;

    // ============ AUTHENTICATION METHODS ============

    /**
     * Admin login
     */
    public AdminLoginResponseDTO login(AdminLoginRequestDTO request) {
        log.info("Admin login attempt for email: {}", request.getEmail());

        // Find admin by email
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AdminException("Invalid email or password"));

        // Check if account is locked
        if (admin.isAccountLocked()) {
            log.warn("Login attempt for locked account: {}", request.getEmail());
            throw new AdminException("Account is temporarily locked. Please try again later.");
        }

        // Check if admin is active
        if (admin.getStatus() != Admin.AdminStatus.ACTIVE) {
            log.warn("Login attempt for inactive account: {}", request.getEmail());
            throw new AdminException("Account is not active. Please contact support.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            handleFailedLogin(admin);
            throw new AdminException("Invalid email or password");
        }

        // Successful login
        handleSuccessfulLogin(admin);

        AdminLoginResponseDTO response = new AdminLoginResponseDTO();
        response.setMessage("Login successful");
        response.setAdmin(new AdminLoginResponseDTO.AdminInfo(admin));
        response.setLoginTime(LocalDateTime.now());

        log.info("Admin login successful for: {}", request.getEmail());
        return response;
    }

    /**
     * Admin signup/registration
     */
    public AdminSignupResponseDTO signup(AdminSignupRequestDTO request, Long createdByAdminId) {
        log.info("Admin signup attempt for email: {}", request.getEmail());

        // Validate password confirmation
        if (!request.isPasswordMatching()) {
            throw new AdminException("Password and confirm password do not match");
        }

        // Check if email already exists
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new AdminException("Email address is already registered");
        }

        // Check if this is the first admin (auto-approve as ROOT_ADMIN)
        boolean isFirstAdmin = adminRepository.count() == 0;

        // Create new admin
        Admin admin = new Admin();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setPhone(request.getPhone());
        admin.setCreatedBy(createdByAdminId);

        if (isFirstAdmin) {
            // First admin becomes ROOT_ADMIN and is auto-approved
            admin.setAdminLevel(Admin.AdminLevel.ROOT_ADMIN);
            admin.setStatus(Admin.AdminStatus.ACTIVE);
            log.info("Creating first ROOT_ADMIN: {}", request.getEmail());
        } else {
            // Subsequent admins need approval
            admin.setAdminLevel(request.getAdminLevel() != null ? request.getAdminLevel() : Admin.AdminLevel.ADMIN);
            admin.setStatus(Admin.AdminStatus.PENDING_APPROVAL);

            // Only ROOT_ADMIN can create other ROOT_ADMINs
            if (request.getAdminLevel() == Admin.AdminLevel.ROOT_ADMIN && createdByAdminId != null) {
                Admin createdBy = getAdminById(createdByAdminId);
                if (!createdBy.isRootAdmin()) {
                    throw new AdminException("Only ROOT_ADMIN can create other ROOT_ADMINs");
                }
            }
        }

        admin = adminRepository.save(admin);

        AdminSignupResponseDTO response = new AdminSignupResponseDTO();
        response.setMessage(isFirstAdmin ? "ROOT_ADMIN account created successfully" :
                "Admin account created. Pending approval.");
        response.setAdmin(new AdminSignupResponseDTO.AdminInfo(admin));
        response.setCreatedAt(admin.getCreatedAt());
        response.setRequiresApproval(!isFirstAdmin);

        log.info("Admin signup successful for: {}", request.getEmail());
        return response;
    }

    // ============ ADMIN MANAGEMENT METHODS ============

    /**
     * Get admin by ID
     */
    @Transactional(readOnly = true)
    public Admin getAdminById(Long id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new AdminException("Admin not found with ID: " + id));
    }

    /**
     * Get admin by email
     */
    @Transactional(readOnly = true)
    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new AdminException("Admin not found with email: " + email));
    }

    /**
     * Get all admins with pagination
     */
    @Transactional(readOnly = true)
    public AdminListResponseDTO getAllAdmins(Pageable pageable, Long requestingAdminId) {
        Admin requestingAdmin = getAdminById(requestingAdminId);

        Page<Admin> adminPage;
        if (requestingAdmin.isRootAdmin()) {
            // ROOT_ADMIN can see all admins
            adminPage = adminRepository.findAll(pageable);
        } else {
            // Regular admins can only see admins they created
            adminPage = adminRepository.findByCreatedBy(requestingAdminId, pageable);
        }

        List<AdminListResponseDTO.AdminSummary> adminSummaries = adminPage.getContent().stream()
                .map(admin -> {
                    String createdByName = admin.getCreatedBy() != null ?
                            getAdminById(admin.getCreatedBy()).getName() : "System";
                    return new AdminListResponseDTO.AdminSummary(admin, createdByName);
                })
                .collect(Collectors.toList());

        AdminListResponseDTO response = new AdminListResponseDTO();
        response.setMessage("Admins retrieved successfully");
        response.setAdmins(adminSummaries);
        response.setTotalCount((int) adminPage.getTotalElements());
        response.setHasMoreData(adminPage.hasNext());

        return response;
    }

    /**
     * Approve pending admin
     */
    public void approveAdmin(Long adminId, Long approvingAdminId) {
        Admin approvingAdmin = getAdminById(approvingAdminId);
        if (!approvingAdmin.canManageAdmins()) {
            throw new AdminException("You don't have permission to approve admins");
        }

        Admin adminToApprove = getAdminById(adminId);
        if (adminToApprove.getStatus() != Admin.AdminStatus.PENDING_APPROVAL) {
            throw new AdminException("Admin is not in pending approval status");
        }

        adminToApprove.setStatus(Admin.AdminStatus.ACTIVE);
        adminRepository.save(adminToApprove);

        log.info("Admin {} approved by {}", adminToApprove.getEmail(), approvingAdmin.getEmail());
    }

    /**
     * Suspend admin
     */
    public void suspendAdmin(Long adminId, Long suspendingAdminId) {
        Admin suspendingAdmin = getAdminById(suspendingAdminId);
        Admin adminToSuspend = getAdminById(adminId);

        // ROOT_ADMIN cannot be suspended
        if (adminToSuspend.isRootAdmin()) {
            throw new AdminException("ROOT_ADMIN cannot be suspended");
        }

        // Only ROOT_ADMIN can suspend other admins
        if (!suspendingAdmin.isRootAdmin()) {
            throw new AdminException("Only ROOT_ADMIN can suspend other admins");
        }

        // Cannot suspend yourself
        if (adminId.equals(suspendingAdminId)) {
            throw new AdminException("You cannot suspend yourself");
        }

        adminToSuspend.setStatus(Admin.AdminStatus.SUSPENDED);
        adminRepository.save(adminToSuspend);

        log.info("Admin {} suspended by {}", adminToSuspend.getEmail(), suspendingAdmin.getEmail());
    }

    /**
     * Update admin details
     */
    public Admin updateAdmin(Long adminId, AdminUpdateRequestDTO request, Long updatingAdminId) {
        Admin updatingAdmin = getAdminById(updatingAdminId);
        Admin adminToUpdate = getAdminById(adminId);

        // Check permissions
        if (!canManageAdmin(updatingAdminId, adminId)) {
            throw new AdminException("You don't have permission to update this admin");
        }

        // Update allowed fields
        adminToUpdate.setName(request.getName());
        adminToUpdate.setPhone(request.getPhone());

        // Only ROOT_ADMIN can change admin levels and status
        if (updatingAdmin.isRootAdmin()) {
            if (request.getAdminLevel() != null) {
                adminToUpdate.setAdminLevel(request.getAdminLevel());
            }
            if (request.getStatus() != null) {
                adminToUpdate.setStatus(request.getStatus());
            }
        }

        return adminRepository.save(adminToUpdate);
    }

    /**
     * Change admin password
     */
    public void changePassword(Long adminId, AdminPasswordChangeRequestDTO request) {
        Admin admin = getAdminById(adminId);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new AdminException("Current password is incorrect");
        }

        // Validate new password confirmation
        if (!request.isNewPasswordMatching()) {
            throw new AdminException("New password and confirm password do not match");
        }

        // Update password
        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminRepository.save(admin);

        log.info("Password changed for admin: {}", admin.getEmail());
    }

    // ============ UTILITY METHODS ============

    /**
     * Check if an admin can manage another admin
     */
    @Transactional(readOnly = true)
    public boolean canManageAdmin(Long managerId, Long targetId) {
        if (managerId.equals(targetId)) {
            return true; // Can manage self
        }

        Admin manager = getAdminById(managerId);
        Admin target = getAdminById(targetId);

        // ROOT_ADMIN can manage all non-ROOT_ADMIN accounts
        if (manager.isRootAdmin() && !target.isRootAdmin()) {
            return true;
        }

        // Admin can manage admins they created (if not ROOT_ADMIN)
        return !target.isRootAdmin() && targetId.equals(target.getCreatedBy());
    }

    /**
     * Get pending approval admins
     */
    @Transactional(readOnly = true)
    public List<Admin> getPendingApprovalAdmins() {
        return adminRepository.findPendingApprovalAdmins();
    }

    /**
     * Check if ROOT_ADMIN exists
     */
    @Transactional(readOnly = true)
    public boolean rootAdminExists() {
        return adminRepository.existsByAdminLevel(Admin.AdminLevel.ROOT_ADMIN);
    }

    // ============ PRIVATE HELPER METHODS ============

    private void handleSuccessfulLogin(Admin admin) {
        admin.setLastLogin(LocalDateTime.now());
        admin.setLoginAttempts(0);
        admin.setAccountLockedUntil(null);
        adminRepository.save(admin);
    }

    private void handleFailedLogin(Admin admin) {
        int attempts = admin.getLoginAttempts() + 1;
        admin.setLoginAttempts(attempts);

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            admin.setAccountLockedUntil(LocalDateTime.now().plusHours(ACCOUNT_LOCK_DURATION_HOURS));
            log.warn("Account locked for admin: {} after {} failed attempts", admin.getEmail(), attempts);
        }

        adminRepository.save(admin);
    }
}