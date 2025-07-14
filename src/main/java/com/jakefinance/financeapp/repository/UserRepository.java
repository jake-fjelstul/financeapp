package com.jakefinance.financeapp.repository;

import com.jakefinance.financeapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // 🔧 This fixes the error
}
