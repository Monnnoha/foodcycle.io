package com.foodredistribution.foodredistribution.aspect;

import com.foodredistribution.foodredistribution.entity.AuditAction;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Mark a service method to have its execution recorded in the audit log.
 * The aspect will capture: who called it, what action, which entity type,
 * and the entity ID returned (if the return type exposes getId()).
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    AuditAction action();
    String entity();   // e.g. "FoodDonation", "PickupRequest", "User"
}
