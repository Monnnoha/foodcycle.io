package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.dto.DonationFilterDTO;
import com.foodredistribution.foodredistribution.entity.FoodDonation;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class DonationSpecification {

    private DonationSpecification() {}

    public static Specification<FoodDonation> fromFilter(DonationFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hasText(filter.getKeyword())) {
                predicates.add(cb.like(
                        cb.lower(root.get("foodDescription")),
                        "%" + filter.getKeyword().toLowerCase() + "%"));
            }

            if (hasText(filter.getFoodType())) {
                predicates.add(cb.like(
                        cb.lower(root.get("foodType")),
                        "%" + filter.getFoodType().toLowerCase() + "%"));
            }

            if (hasText(filter.getCity())) {
                predicates.add(cb.like(
                        cb.lower(root.get("city")),
                        "%" + filter.getCity().toLowerCase() + "%"));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getDonorId() != null) {
                predicates.add(cb.equal(root.get("donor").get("userId"), filter.getDonorId()));
            }

            if (filter.getDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getDateFrom().atStartOfDay()));
            }

            if (filter.getDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getDateTo().atTime(23, 59, 59)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
