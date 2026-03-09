package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.entity.PickupRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PickupRepository  extends JpaRepository<PickupRequest, Long> {
}
