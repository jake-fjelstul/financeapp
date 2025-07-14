package com.jakefinance.financeapp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private double amount;
    private String type;
    private String category;
    private String account;
    private LocalDate date;
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    public Transaction() {}

    public Transaction(String title, double amount, String type, String category, String account, LocalDate date, String notes, User user) {
        this.title = title;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.account = account;
        this.date = date;
        this.notes = notes;
        this.user = user;
    }

    // Getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public Double getAmount() { return amount; }
    public String getType() { return type; }
    public String getCategory() { return category; }
    public String getAccount() { return account; }
    public LocalDate getDate() { return date; }
    public String getNotes() { return notes; }
    public User getUser() { return user; }

    // Setters
    public void setTitle(String title) { this.title = title; }
    public void setAmount(Double amount) { this.amount = amount; }
    public void setType(String type) { this.type = type; }
    public void setCategory(String category) { this.category = category; }
    public void setAccount(String account) { this.account = account; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setUser(User user) { this.user = user; }

    @Override
    public String toString() {
        return "Transaction{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", amount=" + amount +
                ", type='" + type + '\'' +
                ", category='" + category + '\'' +
                ", account='" + account + '\'' +
                ", date=" + date +
                ", notes='" + notes + '\'' +
                ", user=" + (user != null ? user.getEmail() : null) +
                '}';
    }
}