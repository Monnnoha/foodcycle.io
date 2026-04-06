package com.foodredistribution.foodredistribution.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    /**
     * Store the file and return the public URL to be saved in the DB.
     */
    String store(MultipartFile file, String folder);

    /**
     * Delete a file by its URL or public ID.
     * No-op if the file doesn't exist.
     */
    void delete(String urlOrPublicId);
}
