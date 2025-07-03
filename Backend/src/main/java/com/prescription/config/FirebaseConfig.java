package com.prescription.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.storage.bucket}")
    private String storageBucket;

    @Value("${firebase.service.account.key.path}")
    private String serviceAccountKeyPath;

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                ClassPathResource serviceAccount = new ClassPathResource("firebase-service-account.json");

                try (InputStream serviceAccountStream = serviceAccount.getInputStream()) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                            .setStorageBucket(storageBucket)
                            .build();

                    FirebaseApp.initializeApp(options);
                    log.info("Firebase application initialized successfully");
                }
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase", e);
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }

    @Bean
    public Storage storage() throws IOException {
        ClassPathResource serviceAccount = new ClassPathResource("firebase-service-account.json");

        try (InputStream serviceAccountStream = serviceAccount.getInputStream()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccountStream);

            return StorageOptions.newBuilder()
                    .setCredentials(credentials)
                    .build()
                    .getService();
        }
    }
}