package com.jakefinance.financeapp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

@Entity
@Table(name = "goals")
@JsonIgnoreProperties(ignoreUnknown = true) // Ignore unknown properties from JSON
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(columnDefinition = "TEXT")
    private String steps; // JSON string of steps array

    private String timeframe;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY) // Don't allow setting from JSON, only read
    private LocalDate createdAt;

    @Column(nullable = false)
    private Boolean completed = false;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY) // Don't allow setting from JSON, only read
    private LocalDate completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    public Goal() {}

    public Goal(String text, String steps, String timeframe, LocalDate createdAt, Boolean completed, LocalDate completedAt, User user) {
        this.text = text;
        this.steps = steps;
        this.timeframe = timeframe;
        this.createdAt = createdAt;
        this.completed = completed;
        this.completedAt = completedAt;
        this.user = user;
    }

    // Getters
    public Long getId() { return id; }
    public String getText() { return text; }
    public String getSteps() { return steps; }
    public String getTimeframe() { return timeframe; }
    public LocalDate getCreatedAt() { return createdAt; }
    public Boolean getCompleted() { return completed; }
    public LocalDate getCompletedAt() { return completedAt; }
    public User getUser() { return user; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setText(String text) { this.text = text; }
    public void setSteps(String steps) { this.steps = steps; }
    public void setTimeframe(String timeframe) { this.timeframe = timeframe; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    public void setCompletedAt(LocalDate completedAt) { this.completedAt = completedAt; }
    public void setUser(User user) { this.user = user; }
}

