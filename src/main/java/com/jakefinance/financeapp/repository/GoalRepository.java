package com.jakefinance.financeapp.repository;

import com.jakefinance.financeapp.model.Goal;
import com.jakefinance.financeapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUser(User user);
    List<Goal> findByUserAndCompleted(User user, Boolean completed);
}

