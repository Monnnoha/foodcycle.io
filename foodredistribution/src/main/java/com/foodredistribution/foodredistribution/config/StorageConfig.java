package com.foodredistribution.foodredistribution.config;

import com.foodredistribution.foodredistribution.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class StorageConfig {

    @Value("${storage.provider:local}")
    private String storageProvider;

    /**
     * Selects the active StorageService implementation based on storage.provider.
     * Defaults to local. Set storage.provider=cloudinary to switch.
     */
    @Bean
    @Primary
    public StorageService storageService(
            @Qualifier("localStorageService") StorageService local,
            // Cloudinary bean is optional — only present when ConditionalOnProperty matches
            @Autowired(required = false) @Qualifier("cloudinaryStorageService") StorageService cloudinary) {
        if ("cloudinary".equalsIgnoreCase(storageProvider) && cloudinary != null) {
            return cloudinary;
        }
        return local;
    }
}
