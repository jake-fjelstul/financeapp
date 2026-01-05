package com.jakefinance.financeapp.controller;

import com.jakefinance.financeapp.model.Goal;
import com.jakefinance.financeapp.service.GoalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public ResponseEntity<List<Goal>> getAllGoals(Principal principal) {
        String email = principal.getName();
        List<Goal> goals = goalService.getAllGoals(email);
        return ResponseEntity.ok(goals);
    }

    @PostMapping
    public ResponseEntity<?> addGoal(@RequestBody Goal goal, Principal principal) {
        try {
            String email = principal.getName();
            
            // Validate required fields
            if (goal.getText() == null || goal.getText().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Goal text is required"));
            }
            
            // Ensure completed is set (default to false)
            if (goal.getCompleted() == null) {
                goal.setCompleted(false);
            }
            
            // Log for debugging
            System.out.println("Received goal: text=" + goal.getText() + ", steps=" + goal.getSteps() + ", timeframe=" + goal.getTimeframe() + ", completed=" + goal.getCompleted());
            
            Goal saved = goalService.addGoal(goal, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create goal: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, 
                                          @RequestBody Goal goalUpdate,
                                          Principal principal) {
        try {
            String email = principal.getName();
            Goal updated = goalService.updateGoal(id, goalUpdate, email);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Goal> completeGoal(@PathVariable Long id, Principal principal) {
        try {
            String email = principal.getName();
            Goal goalUpdate = new Goal();
            goalUpdate.setCompleted(true);
            Goal updated = goalService.updateGoal(id, goalUpdate, email);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteGoal(@PathVariable Long id, Principal principal) {
        try {
            String email = principal.getName();
            goalService.deleteGoal(id, email);
            return ResponseEntity.ok(Map.of("message", "Goal deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

