package com.prescription.dto;

import lombok.Data;

@Data
public class HospitalDto {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String phone;
    private String email;
    private String website;
}