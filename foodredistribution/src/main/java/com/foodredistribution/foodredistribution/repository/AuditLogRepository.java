package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.entity.AuditAction;
import com.foodredistribution.foodredistribution.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByPerformedByOrderByPerformedAtDesc(String email, Pageable pageable);

    Page<AuditLog> findByEntityTypeAndEntityIdOrderByPerformedAtDesc(
            String entityType, Long entityId, Pageable pageable);

    Page<AuditLog> findByActionOrderByPerformedAtDesc(AuditAction action, Pageable pageable);
}
