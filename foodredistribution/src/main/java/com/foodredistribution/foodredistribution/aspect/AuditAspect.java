package com.foodredistribution.foodredistribution.aspect;

import com.foodredistribution.foodredistribution.service.AuditLogService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    @Autowired
    private AuditLogService auditLogService;

    @Around("@annotation(com.foodredistribution.foodredistribution.aspect.Auditable)")
    public Object audit(ProceedingJoinPoint joinPoint) throws Throwable {
        // Resolve annotation metadata
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Auditable auditable = method.getAnnotation(Auditable.class);

        // Resolve authenticated user — "system" if called outside a request context
        String performedBy = resolveCurrentUser();

        // Execute the actual method
        Object result = joinPoint.proceed();

        // Extract entity ID from the return value if possible
        Long entityId = extractId(result);

        // Build a human-readable detail string from method args
        String detail = buildDetail(joinPoint.getArgs());

        // Persist asynchronously — never blocks the caller
        auditLogService.log(auditable.action(), performedBy, auditable.entity(), entityId, detail);

        log.debug("AUDIT | {} | {} | entity={} id={} | by={}",
                auditable.action(), auditable.entity(), entityId, detail, performedBy);

        return result;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "system";
    }

    /**
     * Tries to call getId() or getXxxId() on the return value to capture the entity ID.
     * Works with any DTO that follows the getId() / getDonationId() / getPickupId() convention.
     */
    private Long extractId(Object result) {
        if (result == null) return null;
        for (String methodName : new String[]{"getId", "getDonationId", "getPickupId", "getUserId"}) {
            try {
                Method getter = result.getClass().getMethod(methodName);
                Object id = getter.invoke(result);
                if (id instanceof Long l) return l;
            } catch (Exception ignored) {
                // method doesn't exist on this type — try next
            }
        }
        return null;
    }

    /**
     * Builds a compact detail string from method arguments for context.
     * Skips null args and truncates to 300 chars.
     */
    private String buildDetail(Object[] args) {
        if (args == null || args.length == 0) return null;
        StringBuilder sb = new StringBuilder();
        for (Object arg : args) {
            if (arg != null) {
                if (!sb.isEmpty()) sb.append(", ");
                String str = arg.toString();
                sb.append(str.length() > 100 ? str.substring(0, 100) + "…" : str);
            }
        }
        String detail = sb.toString();
        return detail.length() > 300 ? detail.substring(0, 300) : detail;
    }
}
