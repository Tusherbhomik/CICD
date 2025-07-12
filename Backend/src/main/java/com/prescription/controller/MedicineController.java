package com.prescription.controller;

import com.prescription.dto.MedicineSearchDto;
import com.prescription.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicines")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    @GetMapping("/search")
    @PreAuthorize("hasRole('DOCTOR')")
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
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicineSearchDto> getMedicineDetails(@PathVariable Long id) {
        try {
            MedicineSearchDto medicine = medicineService.getMedicineDetails(id);
            return ResponseEntity.ok(medicine);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/generics")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<MedicineSearchDto>> searchAllGenerics( @RequestParam(name = "q", required = false) String searchTerm) {
        try {
            List<MedicineSearchDto> medicine = medicineService.getAllgenerics(searchTerm);
            System.out.println(medicine);
            return ResponseEntity.ok(medicine);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}