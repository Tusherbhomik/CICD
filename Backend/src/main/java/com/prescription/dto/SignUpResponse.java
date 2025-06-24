package com.prescription.dto;

import com.prescription.entity.User;
import lombok.*;

/**
 * Returned after a successful registration.
 * If you auto-log the user in, put the freshly generated JWT
 * into {@code token}; otherwise leave it {@code null}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignUpResponse {

    private Long       id;
    private String     name;
    private String     email;
    private User.Role  role;     // DOCTOR or PATIENT
    private String     token;    // optional JWT for immediate login
}
