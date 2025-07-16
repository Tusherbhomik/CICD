package com.prescription.controller;

import com.prescription.dto.MedicineRequestDto;
import com.prescription.dto.MedicineSearchDto;
import com.prescription.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/medicines")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    @GetMapping("/search")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<List<MedicineSearchDto>> searchMedicines(
            @RequestParam(name = "q", required = false) String searchTerm) {
        try {
            List<MedicineSearchDto> medicines = medicineService.searchMedicines(searchTerm);
            return ResponseEntity.ok(medicines);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<MedicineSearchDto> getMedicineDetails(@PathVariable Long id) {
        try {
            MedicineSearchDto medicine = medicineService.getMedicineDetails(id);
            return ResponseEntity.ok(medicine);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/generics")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<List<MedicineSearchDto>> searchAllGenerics(@RequestParam(name = "q", required = false) String searchTerm) {
        try {
            List<MedicineSearchDto> medicine = medicineService.getAllgenerics(searchTerm);
            System.out.println(medicine);
            return ResponseEntity.ok(medicine);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<String> addMedicine(@Valid @RequestBody MedicineRequestDto medicineRequestDto) {
        try {
            System.out.println("In the add medicine method");
            medicineService.saveMedicine(medicineRequestDto);
            return ResponseEntity.ok("Medicine added successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to add medicine: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<String> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequestDto medicineRequestDto) {
        try {
            medicineService.updateMedicine(id, medicineRequestDto);
            return ResponseEntity.ok("Medicine updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to update medicine: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT_ADMIN')")
    public ResponseEntity<String> deleteMedicine(@PathVariable Long id) {
        try {
            medicineService.deleteMedicine(id);
            return ResponseEntity.ok("Medicine deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to delete medicine: " + e.getMessage());
        }
    }
}