package com.prescription.service;

import com.prescription.dto.MedicineRequestDto;
import com.prescription.dto.MedicineSearchDto;
import com.prescription.entity.Medicine;
import com.prescription.entity.MedicineGeneric;
import com.prescription.repository.MedicineGenericRepository;
import com.prescription.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private MedicineGenericRepository medicineGenericRepository;

    public List<MedicineSearchDto> searchMedicines(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            List<Medicine> medicines = medicineRepository.findAll();
            List<MedicineSearchDto> results2 = new ArrayList<>();
            for (Medicine medicine : medicines) {
                MedicineSearchDto dto = convertToSearchDto(medicine);
                results2.add(dto);
            }
            return results2;
        }

        String trimmedSearchTerm = searchTerm.trim();
        List<MedicineSearchDto> results = new ArrayList<>();

        List<Medicine> medicines = medicineRepository.findByNameOrGenericNameContainingIgnoreCase(trimmedSearchTerm);

        for (Medicine medicine : medicines) {
            MedicineSearchDto dto = convertToSearchDto(medicine);
            results.add(dto);
        }

        return results;
    }

    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepository.findById(id);
    }

    public Optional<MedicineGeneric> getMedicineGenericById(Long id) {
        return medicineGenericRepository.findById(id);
    }

    public MedicineSearchDto getMedicineDetails(Long id) {
        Optional<Medicine> medicineOpt = medicineRepository.findById(id);
        if (medicineOpt.isEmpty()) {
            throw new RuntimeException("Medicine not found with id: " + id);
        }

        return convertToSearchDto(medicineOpt.get());
    }

    public List<MedicineSearchDto> getAllgenerics(String searchTerm) {
        System.out.println(2);
        System.out.println(searchTerm);
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            List<MedicineGeneric> medicines = medicineGenericRepository.findAll();
            List<MedicineSearchDto> results2 = new ArrayList<>();
            for (MedicineGeneric medicine : medicines) {
                MedicineSearchDto dto = convertToGenericsSearchDto(medicine);
                results2.add(dto);
            }
            return results2;
        }

        List<MedicineGeneric> medicineGenerics = medicineGenericRepository.findByGenericNameContainingIgnoreCase(searchTerm);
        System.out.println(medicineGenerics);
        System.out.println(3);
        List<MedicineSearchDto> results = new ArrayList<>();
        System.out.println(4);
        for (MedicineGeneric medicineGeneric : medicineGenerics) {
            MedicineSearchDto dto = convertToGenericsSearchDto(medicineGeneric);
            results.add(dto);
        }
        return results;
    }

    @Transactional
    public void saveMedicine(MedicineRequestDto medicineRequestDto) {
        MedicineGeneric generic = medicineGenericRepository.findByGenericNameContainingIgnoreCase(medicineRequestDto.getGenericName())
                .stream().findFirst().orElseGet(() -> {
                    MedicineGeneric newGeneric = new MedicineGeneric();
                    newGeneric.setGenericName(medicineRequestDto.getGenericName());
                    newGeneric.setCategory(medicineRequestDto.getCategory());
                    newGeneric.setDescription(medicineRequestDto.getDescription());
                    newGeneric.setCreatedAt(LocalDateTime.now());
                    newGeneric.setUpdatedAt(LocalDateTime.now());
                    return medicineGenericRepository.save(newGeneric);
                });

        Medicine medicine = new Medicine();
        medicine.setName(medicineRequestDto.getName());
        medicine.setStrength(medicineRequestDto.getStrength());
        medicine.setForm(medicineRequestDto.getForm());
        medicine.setPrice(medicineRequestDto.getPrice());
        medicine.setManufacturer(medicineRequestDto.getManufacturer());
        medicine.setMedicineGeneric(generic);
        medicine.setUpdatedAt(LocalDateTime.now());
        medicine.setCreatedAt(LocalDateTime.now());
        medicineRepository.save(medicine);
    }

    @Transactional
    public void updateMedicine(Long id, MedicineRequestDto medicineRequestDto) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));

        MedicineGeneric generic = medicine.getMedicineGeneric();
        if (generic == null || !generic.getGenericName().equals(medicineRequestDto.getGenericName())) {
            generic = medicineGenericRepository.findByGenericNameContainingIgnoreCase(medicineRequestDto.getGenericName())
                    .stream().findFirst().orElseGet(() -> {
                        MedicineGeneric newGeneric = new MedicineGeneric();
                        newGeneric.setGenericName(medicineRequestDto.getGenericName());
                        newGeneric.setCategory(medicineRequestDto.getCategory());
                        newGeneric.setDescription(medicineRequestDto.getDescription());
                        return medicineGenericRepository.save(newGeneric);
                    });
        } else {
            generic.setCategory(medicineRequestDto.getCategory());
            generic.setDescription(medicineRequestDto.getDescription());
        }

        medicine.setName(medicineRequestDto.getName());
        medicine.setStrength(medicineRequestDto.getStrength());
        medicine.setForm(medicineRequestDto.getForm());
        medicine.setPrice(medicineRequestDto.getPrice());
        medicine.setManufacturer(medicineRequestDto.getManufacturer());
        medicine.setMedicineGeneric(generic);
        medicineRepository.save(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        medicineRepository.delete(medicine);
    }

    public MedicineSearchDto convertToGenericsSearchDto(MedicineGeneric genre) {
        MedicineSearchDto dto = new MedicineSearchDto();
        dto.setId(genre.getId());
        dto.setGenericName(genre.getGenericName());
        dto.setCategory(genre.getCategory());
        dto.setDescription(genre.getDescription());

        List<Medicine> medicines = medicineRepository.findByMedicineGenericId(genre.getId());
        List<MedicineSearchDto> medicineDtos = new ArrayList<>();
        for (Medicine medicine : medicines) {
            MedicineSearchDto medicineDto = convertToSearchDto(medicine);
            medicineDtos.add(medicineDto);
        }
        dto.setMedicines(medicineDtos);

        return dto;
    }

    public MedicineSearchDto convertToSearchDto(Medicine medicine) {
        MedicineSearchDto dto = new MedicineSearchDto();
        dto.setId(medicine.getId());
        dto.setName(medicine.getName());
        dto.setStrength(medicine.getStrength());
        dto.setForm(medicine.getForm().name());
        dto.setPrice(medicine.getPrice());
        dto.setManufacturer(medicine.getManufacturer());

        MedicineGeneric generic = medicine.getMedicineGeneric();
        if (generic != null) {
            dto.setGenericName(generic.getGenericName());
            dto.setCategory(generic.getCategory());
            dto.setDescription(generic.getDescription());
        }

        return dto;
    }
}