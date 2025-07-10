package com.prescription.service;

import com.prescription.dto.MedicineSearchDto;
import com.prescription.entity.Medicine;
import com.prescription.entity.MedicineGeneric;
import com.prescription.repository.MedicineGenericRepository;
import com.prescription.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            List<Medicine> medicines;
//            System.out.println("yes i am in");

            medicines = medicineRepository.findAll();
            System.out.println(medicines);
            List<MedicineSearchDto> results2 = new ArrayList<>();
            for (Medicine medicine : medicines) {
                MedicineSearchDto dto = convertToSearchDto(medicine);
                results2.add(dto);
            }
            return results2;
        }

        String trimmedSearchTerm = searchTerm.trim();
        List<MedicineSearchDto> results = new ArrayList<>();

        // Search by medicine name or generic name
        List<Medicine> medicines = medicineRepository.findByNameOrGenericNameContainingIgnoreCase(trimmedSearchTerm);

        for (Medicine medicine : medicines) {
            MedicineSearchDto dto = convertToSearchDto(medicine);
            results.add(dto);
        }

//        // Also search for generic medicines if not many results found
//        if (results.size() < 10) {
//            List<MedicineGeneric> generics = medicineGenericRepository.findByGenericNameContainingIgnoreCase(trimmedSearchTerm);
//
//            for (MedicineGeneric generic : generics) {
//                // Add all medicines for this generic
//                List<Medicine> genericMedicines = medicineRepository.findByMedicineGenericId(generic.getId());
//                for (Medicine medicine : genericMedicines) {
//                    MedicineSearchDto dto = convertToSearchDto(medicine);
//                    // Avoid duplicates
//                    if (!results.stream().anyMatch(r -> r.getId().equals(dto.getId()))) {
//                        results.add(dto);
//                    }
//                }
//            }
//        }
//        System.out.println(results);
//
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

    public MedicineSearchDto convertToSearchDto(Medicine medicine) {
        MedicineSearchDto dto = new MedicineSearchDto();
        dto.setId(medicine.getId());
        dto.setName(medicine.getName());
        dto.setStrength(medicine.getStrength());
        dto.setForm(medicine.getForm().name());
        dto.setPrice(medicine.getPrice());
        dto.setManufacturer(medicine.getManufacturer());

        // Add generic information
        MedicineGeneric generic = medicine.getMedicineGeneric();
        if (generic != null) {
            dto.setGenericName(generic.getGenericName());
            dto.setCategory(generic.getCategory());
            dto.setDescription(generic.getDescription());
        }

        return dto;
    }
}