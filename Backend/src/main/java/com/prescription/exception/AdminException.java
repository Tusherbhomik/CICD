package com.prescription.exception;

/** 
 * Custom exception for Admin-related operations
 * This exception is thrown when admin-specific business logic fails
 */
public class AdminException extends RuntimeException {

    private String errorCode;
    private Object[] parameters;

    public AdminException(String message) {
        super(message);
    }

    public AdminException(String message, Throwable cause) {
        super(message, cause);
    }

    public AdminException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public AdminException(String errorCode, String message, Object... parameters) {
        super(message);
        this.errorCode = errorCode;
        this.parameters = parameters;
    }

    public AdminException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Object[] getParameters() {
        return parameters;
    }
}