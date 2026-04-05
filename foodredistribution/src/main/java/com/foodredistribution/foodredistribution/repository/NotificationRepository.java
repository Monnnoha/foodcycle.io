package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Notification> findByRecipientUserIdAndReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByRecipientUserIdAndReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.userId = :userId")
    void markAllReadForUser(@Param("userId") Long userId);
}
