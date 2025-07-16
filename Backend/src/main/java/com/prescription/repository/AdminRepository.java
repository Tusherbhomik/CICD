package com.prescription.repository;

import com.prescription.entity.Admin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    // ============ AUTHENTICATION QUERIES ============

    /**
     * Find admin by email for authentication
     */
    Optional<Admin> findByEmail(String email);

    /**
     * Check if admin exists by email
     */
    boolean existsByEmail(String email);

    /**
     * Find active admin by email - FIXED: Using parameter instead of string literal
     */
    @Query("SELECT a FROM Admin a WHERE a.email = :email AND a.status = :status")
    Optional<Admin> findActiveAdminByEmail(@Param("email") String email, @Param("status") Admin.AdminStatus status);

    // Convenience method with default ACTIVE status
    default Optional<Admin> findActiveAdminByEmail(String email) {
        return findActiveAdminByEmail(email, Admin.AdminStatus.ACTIVE);
    }

    // ============ ADMIN LEVEL QUERIES ============

    /**
     * Find all root admins
     */
    List<Admin> findByAdminLevel(Admin.AdminLevel adminLevel);

    /**
     * Check if any root admin exists
     */
    boolean existsByAdminLevel(Admin.AdminLevel adminLevel);

    /**
     * Count admins by admin level
     */
    long countByAdminLevel(Admin.AdminLevel adminLevel);

    // ============ STATUS QUERIES ============

    /**
     * Find admins by status
     */
    List<Admin> findByStatus(Admin.AdminStatus status);

    /**
     * Find admins by status with pagination
     */
    Page<Admin> findByStatus(Admin.AdminStatus status, Pageable pageable);

    /**
     * Find pending approval admins - FIXED: Using parameter instead of string literal
     */
    @Query("SELECT a FROM Admin a WHERE a.status = :status ORDER BY a.createdAt ASC")
    List<Admin> findPendingApprovalAdmins(@Param("status") Admin.AdminStatus status);

    // Convenience method with default PENDING_APPROVAL status
    default List<Admin> findPendingApprovalAdmins() {
        return findPendingApprovalAdmins(Admin.AdminStatus.PENDING_APPROVAL);
    }

    // ============ SEARCH QUERIES ============

    /**
     * Search admins by name or email
     */
    @Query("SELECT a FROM Admin a WHERE " +
            "LOWER(a.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(a.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Admin> searchAdmins(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find admins created by specific admin
     */
    List<Admin> findByCreatedBy(Long createdBy);

    /**
     * Find admins created by specific admin with pagination
     */
    Page<Admin> findByCreatedBy(Long createdBy, Pageable pageable);

    // ============ SECURITY QUERIES ============

    /**
     * Find locked admin accounts
     */
    @Query("SELECT a FROM Admin a WHERE a.accountLockedUntil IS NOT NULL AND a.accountLockedUntil > :currentTime")
    List<Admin> findLockedAccounts(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Find admins with failed login attempts
     */
    @Query("SELECT a FROM Admin a WHERE a.loginAttempts >= :minAttempts")
    List<Admin> findAdminsWithFailedAttempts(@Param("minAttempts") Integer minAttempts);

    // ============ UPDATE QUERIES ============

    /**
     * Update last login time
     */
    @Modifying
    @Query("UPDATE Admin a SET a.lastLogin = :loginTime WHERE a.id = :adminId")
    void updateLastLogin(@Param("adminId") Long adminId, @Param("loginTime") LocalDateTime loginTime);

    /**
     * Update login attempts
     */
    @Modifying
    @Query("UPDATE Admin a SET a.loginAttempts = :attempts WHERE a.id = :adminId")
    void updateLoginAttempts(@Param("adminId") Long adminId, @Param("attempts") Integer attempts);

    /**
     * Reset login attempts
     */
    @Modifying
    @Query("UPDATE Admin a SET a.loginAttempts = 0, a.accountLockedUntil = NULL WHERE a.id = :adminId")
    void resetLoginAttempts(@Param("adminId") Long adminId);

    /**
     * Lock admin account
     */
    @Modifying
    @Query("UPDATE Admin a SET a.accountLockedUntil = :lockUntil WHERE a.id = :adminId")
    void lockAccount(@Param("adminId") Long adminId, @Param("lockUntil") LocalDateTime lockUntil);

    /**
     * Update admin status
     */
    @Modifying
    @Query("UPDATE Admin a SET a.status = :status WHERE a.id = :adminId")
    void updateAdminStatus(@Param("adminId") Long adminId, @Param("status") Admin.AdminStatus status);

    /**
     * Update admin password
     */
    @Modifying
    @Query("UPDATE Admin a SET a.password = :password WHERE a.id = :adminId")
    void updatePassword(@Param("adminId") Long adminId, @Param("password") String password);

    // ============ STATISTICS QUERIES ============

    /**
     * Count total active admins - FIXED: Using parameter instead of string literal
     */
    @Query("SELECT COUNT(a) FROM Admin a WHERE a.status = :status")
    long countActiveAdmins(@Param("status") Admin.AdminStatus status);

    // Convenience method with default ACTIVE status
    default long countActiveAdmins() {
        return countActiveAdmins(Admin.AdminStatus.ACTIVE);
    }

    /**
     * Count admins created in date range
     */
    @Query("SELECT COUNT(a) FROM Admin a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    long countAdminsCreatedBetween(@Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);

    /**
     * Find recently created admins
     */
    @Query("SELECT a FROM Admin a WHERE a.createdAt >= :sinceDate ORDER BY a.createdAt DESC")
    List<Admin> findRecentlyCreatedAdmins(@Param("sinceDate") LocalDateTime sinceDate);

    /**
     * Find admins who haven't logged in recently
     */
    @Query("SELECT a FROM Admin a WHERE a.lastLogin IS NULL OR a.lastLogin < :beforeDate")
    List<Admin> findInactiveAdmins(@Param("beforeDate") LocalDateTime beforeDate);

    // ============ HIERARCHY QUERIES ============

    /**
     * Check if admin can manage target admin (hierarchy check)
     * FIXED: Using Spring Data JPA method query - no @Query needed!
     */
    boolean existsByIdAndAdminLevel(Long id, Admin.AdminLevel adminLevel);

    /**
     * Find admins that current admin can manage - FIXED: Using parameters
     */
    @Query("SELECT a FROM Admin a WHERE " +
            "(:currentAdminLevel = :rootAdminLevel AND a.adminLevel != :rootAdminLevel) OR " +
            "(:currentAdminLevel = :rootAdminLevel AND a.id != :currentAdminId)")
    Page<Admin> findManageableAdmins(@Param("currentAdminLevel") Admin.AdminLevel currentAdminLevel,
                                     @Param("currentAdminId") Long currentAdminId,
                                     @Param("rootAdminLevel") Admin.AdminLevel rootAdminLevel,
                                     Pageable pageable);

    // Convenience method with default ROOT_ADMIN level
    default Page<Admin> findManageableAdmins(Admin.AdminLevel currentAdminLevel, Long currentAdminId, Pageable pageable) {
        return findManageableAdmins(currentAdminLevel, currentAdminId, Admin.AdminLevel.ROOT_ADMIN, pageable);
    }
}