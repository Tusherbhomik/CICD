package com.prescription.controller;

import com.prescription.dto.HospitalDto;
import com.prescription.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hospitals")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping
    public ResponseEntity<List<HospitalDto>> getAllActiveHospitals() {
        List<HospitalDto> hospitals = hospitalService.getAllActiveHospitals();
        return ResponseEntity.ok(hospitals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalDto> getHospitalById(@PathVariable Long id) {
        HospitalDto hospital = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(hospital);
    }

    @GetMapping("/search")
    public ResponseEntity<List<HospitalDto>> searchHospitals(@RequestParam String query) {
        List<HospitalDto> hospitals = hospitalService.searchHospitals(query);
        return ResponseEntity.ok(hospitals);
    }

    @PostMapping
    public ResponseEntity<HospitalDto> createHospital(@RequestBody HospitalDto hospitalDto) {
        HospitalDto createdHospital = hospitalService.createHospital(hospitalDto);
        return ResponseEntity.ok(createdHospital);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HospitalDto> updateHospital(@PathVariable Long id, @RequestBody HospitalDto hospitalDto) {
        HospitalDto updatedHospital = hospitalService.updateHospital(id, hospitalDto);
        return ResponseEntity.ok(updatedHospital);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.noContent().build();
    }
}