package com.foodredistribution.foodredistribution.dto;

import com.foodredistribution.foodredistribution.entity.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Long id;
    private AuditAction action;
    private String performedBy;
    private String entityType;
    private Long entityId;
    private String detail;
    private LocalDateTime performedAt;
}
