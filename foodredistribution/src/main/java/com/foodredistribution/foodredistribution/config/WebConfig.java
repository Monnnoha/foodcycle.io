package com.foodredistribution.foodredistribution.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${storage.local.upload-dir}")
    private String uploadDir;

    /**
     * Serves uploaded files at /uploads/** from the local upload directory.
     * In production with Cloudinary this handler is unused — Cloudinary returns
     * its own CDN URL directly.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
