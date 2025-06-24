package com.prescription.repository;

import com.prescription.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// User Repository
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);
    @Query("SELECT u FROM User u WHERE u.role = 'PATIENT'")
    List<User> findAllPatients();
    @Query("SELECT u FROM User u WHERE u.role = 'DOCTOR'")
    List<User> findAllDoctors();

    Optional<User> findById(Long id);

//    List<User> findByRoleAndAvailable(String role, boolean available);

    //List<User> findByRoleAndSpecializationContainingIgnoreCaseAndAvailable(String role, String specialization, boolean available);
    //List<User> findByRoleAndLocationContainingIgnoreCaseAndAvailable(String role, String location, boolean available);
   // List<User> findByRoleAndNameContainingIgnoreCaseAndAvailable(String role, String name, boolean available);

    //List<User> findByRoleAndSpecializationContainingIgnoreCaseAndLocationContainingIgnoreCaseAndAvailable(
            //String role, String specialization, String location, boolean available);
   // List<User> findByRoleAndSpecializationContainingIgnoreCaseAndNameContainingIgnoreCaseAndAvailable(
            //String role, String specialization, String name, boolean available);
//    List<User> findByRoleAndLocationContainingIgnoreCaseAndNameContainingIgnoreCaseAndAvailable(
//            String role, String location, String name, boolean available);

//    List<User> findByRoleAndSpecializationContainingIgnoreCaseAndLocationContainingIgnoreCaseAndNameContainingIgnoreCaseAndAvailable(
//            String role, String specialization, String location, String name, boolean available);

}

