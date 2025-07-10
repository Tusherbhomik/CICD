package com.prescription.repository;

import com.prescription.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

// Medicine Repository
@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query("SELECT m FROM Medicine m JOIN m.medicineGeneric mg WHERE " +
            "LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(mg.genericName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Medicine> findByNameOrGenericNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);

    List<Medicine> findByMedicineGenericId(Long genericId);


    @Query("SELECT m FROM Medicine m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Medicine> findByNameContainingIgnoreCase(@Param("name") String name);
}
