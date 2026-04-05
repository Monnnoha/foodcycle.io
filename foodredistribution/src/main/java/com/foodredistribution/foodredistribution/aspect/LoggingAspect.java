package com.foodredistribution.foodredistribution.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    @Around("execution(* com.foodredistribution.foodredistribution.controller..*(..))" +
            " || execution(* com.foodredistribution.foodredistribution.service..*(..))")
    public Object logExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        Logger log = LoggerFactory.getLogger(joinPoint.getTarget().getClass());
        String method = joinPoint.getSignature().toShortString();

        log.info("→ {}", method);
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            log.info("← {} completed in {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("✗ {} threw {}: {}", method, ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }
}
