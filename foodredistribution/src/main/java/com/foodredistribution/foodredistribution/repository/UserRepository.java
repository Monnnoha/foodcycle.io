package com.foodredistribution.foodredistribution.repository;

import com.foodredistribution.foodredistribution.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
