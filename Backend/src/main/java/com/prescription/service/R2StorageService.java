package com.prescription.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class R2StorageService {

    private final S3Client s3Client;

    @Value("${r2.bucket}")
    private String bucketName;

    @Value("${r2.public-url}")
    private String publicUrl;

    @Value("${app.profile.image.max-size}")
    private long maxFileSize;

    @Value("${app.profile.image.allowed-types}")
    private List<String> allowedTypes;

    private static final String PROFILE_PICTURES_FOLDER = "profile-pictures";

    public String uploadProfileImage(MultipartFile file, Long userId) throws IOException {
        validateFile(file);

        String fileName = generateFileName(file.getOriginalFilename(), userId);
        String objectKey = PROFILE_PICTURES_FOLDER + "/" + userId + "/" + fileName;

        // Delete existing profile image first
        deleteExistingProfileImages(userId);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(file.getContentType())
                .cacheControl("public, max-age=31536000")
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        log.info("Profile image uploaded to R2 for user: {} key: {}", userId, objectKey);

        return buildPublicUrl(objectKey);
    }

    public void deleteProfileImage(Long userId, String imageUrl) {
        try {
            String objectKey = extractObjectKeyFromUrl(imageUrl);
            if (objectKey != null) {
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .build());
                log.info("Profile image deleted from R2 for user: {}", userId);
            }
        } catch (Exception e) {
            log.error("Error deleting profile image for user: {}", userId, e);
            throw new RuntimeException("Failed to delete profile image", e);
        }
    }

    private void deleteExistingProfileImages(Long userId) {
        try {
            String prefix = PROFILE_PICTURES_FOLDER + "/" + userId + "/";
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build();

            ListObjectsV2Response listing = s3Client.listObjectsV2(listRequest);
            for (S3Object obj : listing.contents()) {
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(obj.key())
                        .build());
                log.info("Deleted existing profile image: {}", obj.key());
            }
        } catch (Exception e) {
            log.warn("Could not delete existing profile images for user: {}", userId, e);
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
        String extension = "";
        if (originalFileName != null && originalFileName.lastIndexOf('.') != -1) {
            extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
        }
        return "profile_" + System.currentTimeMillis() + extension;
    }

    private String buildPublicUrl(String objectKey) {
        String base = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/";
        return base + objectKey;
    }

    private String extractObjectKeyFromUrl(String imageUrl) {
        if (imageUrl == null) return null;
        try {
            String base = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/";
            if (imageUrl.startsWith(base)) {
                return imageUrl.substring(base.length());
            }
        } catch (Exception e) {
            log.error("Error extracting object key from URL: {}", imageUrl, e);
        }
        return null;
    }
}
