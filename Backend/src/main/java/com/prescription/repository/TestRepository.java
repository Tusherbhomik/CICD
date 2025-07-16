package com.prescription.repository;

import com.prescription.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestRepository extends JpaRepository<User, Integer> {
}
