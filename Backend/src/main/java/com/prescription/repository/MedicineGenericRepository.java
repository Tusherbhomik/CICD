package com.prescription.repository;

import com.prescription.entity.MedicineGeneric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Medicine Generic Repository
@Repository
public interface MedicineGenericRepository extends JpaRepository<MedicineGeneric, Long> {

    @Query("SELECT mg FROM MedicineGeneric mg WHERE " +
            "LOWER(mg.genericName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<MedicineGeneric> findByGenericNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);

    Optional<MedicineGeneric> findByGenericNameIgnoreCase(String genericName);

    List<MedicineGeneric> findByCategory(String category);
}
