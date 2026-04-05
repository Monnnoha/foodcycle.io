package com.foodredistribution.foodredistribution.controller;

import com.foodredistribution.foodredistribution.dto.ApiResponse;
import com.foodredistribution.foodredistribution.dto.AuditLogDTO;
import com.foodredistribution.foodredistribution.entity.AuditAction;
import com.foodredistribution.foodredistribution.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@Tag(name = "Audit Logs", description = "Business event audit trail (ADMIN only)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get all audit logs, newest first")
    public ApiResponse<Page<AuditLogDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(auditLogService.getAll(page, size));
    }

    @GetMapping("/user/{email}")
    @Operation(summary = "Get audit logs for a specific user by email")
    public ApiResponse<Page<AuditLogDTO>> getByUser(
            @PathVariable String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(auditLogService.getByUser(email, page, size));
    }

    @GetMapping("/entity/{type}/{id}")
    @Operation(summary = "Get audit logs for a specific entity (e.g. FoodDonation/5)")
    public ApiResponse<Page<AuditLogDTO>> getByEntity(
            @PathVariable String type,
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(auditLogService.getByEntity(type, id, page, size));
    }

    @GetMapping("/action/{action}")
    @Operation(summary = "Get audit logs filtered by action type")
    public ApiResponse<Page<AuditLogDTO>> getByAction(
            @PathVariable AuditAction action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(auditLogService.getByAction(action, page, size));
    }
}
