package com.prescription.service;

import com.prescription.dto.HospitalDto;
import com.prescription.entity.Hospital;
import com.prescription.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public List<HospitalDto> getAllActiveHospitals() {
        return hospitalRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public HospitalDto getHospitalById(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
        return convertToDto(hospital);
    }
    public Hospital getHospitalById2(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
       return hospital;
    }


    public List<HospitalDto> searchHospitals(String query) {
        return hospitalRepository.findByNameContainingIgnoreCase(query).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HospitalDto createHospital(HospitalDto hospitalDto) {
        Hospital hospital = new Hospital();
        updateHospitalEntity(hospital, hospitalDto);
        Hospital savedHospital = hospitalRepository.save(hospital);
        return convertToDto(savedHospital);
    }

    @Transactional
    public HospitalDto updateHospital(Long id, HospitalDto hospitalDto) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
        updateHospitalEntity(hospital, hospitalDto);
        Hospital updatedHospital = hospitalRepository.save(hospital);
        return convertToDto(updatedHospital);
    }

    @Transactional
    public void deleteHospital(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
        hospitalRepository.delete(hospital);
    }

    private HospitalDto convertToDto(Hospital hospital) {
        HospitalDto dto = new HospitalDto();
        dto.setId(hospital.getId());
        dto.setName(hospital.getName());
        dto.setAddress(hospital.getAddress());
        dto.setCity(hospital.getCity());
        dto.setState(hospital.getState());
        dto.setZipCode(hospital.getZipCode());
        dto.setPhone(hospital.getPhone());
        dto.setEmail(hospital.getEmail());
        dto.setWebsite(hospital.getWebsite());
        return dto;
    }

    private void updateHospitalEntity(Hospital hospital, HospitalDto dto) {
        hospital.setName(dto.getName());
        hospital.setAddress(dto.getAddress());
        hospital.setCity(dto.getCity());
        hospital.setState(dto.getState());
        hospital.setZipCode(dto.getZipCode());
        hospital.setPhone(dto.getPhone());
        hospital.setEmail(dto.getEmail());
        hospital.setWebsite(dto.getWebsite());
    }
}