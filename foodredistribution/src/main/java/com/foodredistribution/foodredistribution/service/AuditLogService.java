package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.AuditLogDTO;
import com.foodredistribution.foodredistribution.entity.AuditAction;
import com.foodredistribution.foodredistribution.entity.AuditLog;
import com.foodredistribution.foodredistribution.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Persists an audit entry asynchronously so it never blocks the request thread.
     */
    @Async
    public void log(AuditAction action, String performedBy,
                    String entityType, Long entityId, String detail) {
        auditLogRepository.save(new AuditLog(action, performedBy, entityType, entityId, detail));
    }

    public Page<AuditLogDTO> getByUser(String email, int page, int size) {
        return auditLogRepository
                .findByPerformedByOrderByPerformedAtDesc(email, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public Page<AuditLogDTO> getByEntity(String entityType, Long entityId, int page, int size) {
        return auditLogRepository
                .findByEntityTypeAndEntityIdOrderByPerformedAtDesc(entityType, entityId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public Page<AuditLogDTO> getByAction(AuditAction action, int page, int size) {
        return auditLogRepository
                .findByActionOrderByPerformedAtDesc(action, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public Page<AuditLogDTO> getAll(int page, int size) {
        return auditLogRepository
                .findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    private AuditLogDTO toDTO(AuditLog log) {
        return new AuditLogDTO(
                log.getId(),
                log.getAction(),
                log.getPerformedBy(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDetail(),
                log.getPerformedAt()
        );
    }
}
