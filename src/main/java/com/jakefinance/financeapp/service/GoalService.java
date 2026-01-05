package com.jakefinance.financeapp.service;

import com.jakefinance.financeapp.model.Goal;
import com.jakefinance.financeapp.model.User;
import com.jakefinance.financeapp.repository.GoalRepository;
import com.jakefinance.financeapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    public List<Goal> getAllGoals(String email) {
        User user = getUserByEmail(email);
        return goalRepository.findByUser(user);
    }

    public Goal addGoal(Goal goal, String email) {
        User user = getUserByEmail(email);
        goal.setUser(user);
        
        // Always set createdAt if not already set (shouldn't be set from frontend)
        if (goal.getCreatedAt() == null) {
            goal.setCreatedAt(LocalDate.now());
        }
        
        // Always set completed if not already set
        if (goal.getCompleted() == null) {
            goal.setCompleted(false);
        }
        
        // Ensure completedAt is null for new goals
        if (!goal.getCompleted()) {
            goal.setCompletedAt(null);
        }
        
        return goalRepository.save(goal);
    }

    public Optional<Goal> getGoal(Long id) {
        return goalRepository.findById(id);
    }

    public Goal updateGoal(Long id, Goal goalUpdate, String email) {
        User user = getUserByEmail(email);
        Optional<Goal> existingGoal = goalRepository.findById(id);
        
        if (existingGoal.isEmpty()) {
            throw new IllegalArgumentException("Goal not found");
        }
        
        Goal goal = existingGoal.get();
        
        // Verify the goal belongs to the user
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Goal does not belong to user");
        }
        
        // Update fields
        if (goalUpdate.getText() != null) {
            goal.setText(goalUpdate.getText());
        }
        if (goalUpdate.getSteps() != null) {
            goal.setSteps(goalUpdate.getSteps());
        }
        if (goalUpdate.getTimeframe() != null) {
            goal.setTimeframe(goalUpdate.getTimeframe());
        }
        if (goalUpdate.getCompleted() != null) {
            goal.setCompleted(goalUpdate.getCompleted());
            if (goalUpdate.getCompleted() && goal.getCompletedAt() == null) {
                goal.setCompletedAt(LocalDate.now());
            } else if (!goalUpdate.getCompleted()) {
                goal.setCompletedAt(null);
            }
        }
        
        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id, String email) {
        User user = getUserByEmail(email);
        Optional<Goal> goal = goalRepository.findById(id);
        
        if (goal.isEmpty()) {
            throw new IllegalArgumentException("Goal not found");
        }
        
        // Verify the goal belongs to the user
        if (!goal.get().getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Goal does not belong to user");
        }
        
        goalRepository.deleteById(id);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found for email: " + email));
    }
}

