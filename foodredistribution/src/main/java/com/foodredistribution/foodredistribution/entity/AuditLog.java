package com.foodredistribution.foodredistribution.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_user",      columnList = "performed_by"),
        @Index(name = "idx_audit_entity",    columnList = "entity_type, entity_id"),
        @Index(name = "idx_audit_timestamp", columnList = "performed_at")
})
@Getter
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AuditAction action;

    /** Email of the authenticated user who triggered the action */
    @Column(name = "performed_by", nullable = false, length = 150)
    private String performedBy;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    /** ID of the affected record — null if not determinable */
    @Column(name = "entity_id")
    private Long entityId;

    /** Optional human-readable detail, e.g. status transition */
    @Column(length = 300)
    private String detail;

    @CreationTimestamp
    @Column(name = "performed_at", nullable = false, updatable = false)
    private LocalDateTime performedAt;

    public AuditLog(AuditAction action, String performedBy,
                    String entityType, Long entityId, String detail) {
        this.action = action;
        this.performedBy = performedBy;
        this.entityType = entityType;
        this.entityId = entityId;
        this.detail = detail;
    }
}
