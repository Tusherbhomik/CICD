package com.prescription.dto;

import java.math.BigDecimal;
import java.util.List;

// Medicine DTOs
public class MedicineSearchDto {
    private Long id;
    private String name;
    private String genericName;
    private String strength;
    private String form;
    private BigDecimal price;
    private String manufacturer;
    private String category;
    private String description; // JSON string
    private List<MedicineSearchDto> medicines; // Added to hold medicines for generics

    // Constructors
    public MedicineSearchDto() {
    }

    public MedicineSearchDto(Long id, String name, String genericName, String strength,
                             String form, BigDecimal price, String category, String description) {
        this.id = id;
        this.name = name;
        this.genericName = genericName;
        this.strength = strength;
        this.form = form;
        this.price = price;
        this.category = category;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGenericName() {
        return genericName;
    }

    public void setGenericName(String genericName) {
        this.genericName = genericName;
    }

    public String getStrength() {
        return strength;
    }

    public void setStrength(String strength) {
        this.strength = strength;
    }

    public String getForm() {
        return form;
    }

    public void setForm(String form) {
        this.form = form;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<MedicineSearchDto> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<MedicineSearchDto> medicines) {
        this.medicines = medicines;
    }
}