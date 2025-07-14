package com.jakefinance.financeapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")  // optional: avoids conflict with reserved SQL words
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // === Constructors ===
    public User() {
    }

    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // === Getters and Setters ===
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
