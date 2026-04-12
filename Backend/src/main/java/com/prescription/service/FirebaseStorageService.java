package com.prescription.service;

import com.google.cloud.storage.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class FirebaseStorageService {

    private final Storage storage;

    @Value("${firebase.storage.bucket}")
    private String bucketName;

    @Value("${app.profile.image.max-size}")
    private long maxFileSize;

    @Value("${app.profile.image.allowed-types}")
    private List<String> allowedTypes;

    private static final String PROFILE_PICTURES_FOLDER = "profile-pictures";

    public String uploadProfileImage(MultipartFile file, Long userId) throws IOException {
        validateFile(file);

        String fileName = generateFileName(file.getOriginalFilename(), userId);
        String objectName = PROFILE_PICTURES_FOLDER + "/" + userId + "/" + fileName;

        // Delete existing profile image if any
        deleteExistingProfileImage(userId);

        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .setCacheControl("public, max-age=31536000") // Cache for 1 year
                .build();

        Blob blob = storage.create(blobInfo, file.getBytes());

        log.info("Profile image uploaded successfully for user: {} with blob name: {}", userId, objectName);

        return generatePublicUrl(objectName);
    }

    public void deleteProfileImage(Long userId, String imageUrl) {
        try {
            String objectName = extractObjectNameFromUrl(imageUrl);
            if (objectName != null) {
                BlobId blobId = BlobId.of(bucketName, objectName);
                boolean deleted = storage.delete(blobId);

                if (deleted) {
                    log.info("Profile image deleted successfully for user: {}", userId);
                } else {
                    log.warn("Profile image not found for deletion for user: {}", userId);
                }
            }
        } catch (Exception e) {
            log.error("Error deleting profile image for user: {}", userId, e);
            throw new RuntimeException("Failed to delete profile image", e);
        }
    }

    private void deleteExistingProfileImage(Long userId) {
        try {
            String prefix = PROFILE_PICTURES_FOLDER + "/" + userId + "/";

            storage.list(bucketName, Storage.BlobListOption.prefix(prefix))
                    .iterateAll()
                    .forEach(blob -> {
                        storage.delete(blob.getBlobId());
                        log.info("Deleted existing profile image: {}", blob.getName());
                    });
        } catch (Exception e) {
            log.warn("Error deleting existing profile images for user: {}", userId, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of " + maxFileSize + " bytes");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed. Allowed types: " + allowedTypes);
        }
    }

    private String generateFileName(String originalFileName, Long userId) {
        String extension = getFileExtension(originalFileName);
        return "profile_" + System.currentTimeMillis() + extension;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.'));
    }

    private String generatePublicUrl(String objectName) {
        try {
            BlobId blobId = BlobId.of(bucketName, objectName);
            Blob blob = storage.get(blobId);

            if (blob != null) {
                // Generate a signed URL that doesn't expire (for public access)
                return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                        bucketName, objectName.replace("/", "%2F"));
            }

            throw new RuntimeException("Failed to generate public URL for uploaded file");
        } catch (Exception e) {
            log.error("Error generating public URL for object: {}", objectName, e);
            throw new RuntimeException("Failed to generate public URL", e);
        }
    }

    private String extractObjectNameFromUrl(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.contains(bucketName)) {
                String[] parts = imageUrl.split("/o/");
                if (parts.length > 1) {
                    String objectPath = parts[1].split("\\?")[0];
                    return objectPath.replace("%2F", "/");
                }
            }
        } catch (Exception e) {
            log.error("Error extracting object name from URL: {}", imageUrl, e);
        }
        return null;
    }

    public String generateSignedUrl(String objectName, long duration, TimeUnit timeUnit) {
        try {
            BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, objectName)).build();
            return storage.signUrl(blobInfo, duration, timeUnit).toString();
        } catch (Exception e) {
            log.error("Error generating signed URL for object: {}", objectName, e);
            throw new RuntimeException("Failed to generate signed URL", e);
        }
    }
}