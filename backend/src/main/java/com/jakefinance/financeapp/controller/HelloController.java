package com.jakefinance.financeapp.controller;
import org.springframework.web.bind.annotation.*;

@RestController
public class HelloController {
    @GetMapping("/")
    public String home() {
        return "Backend is working!";
    }
}
