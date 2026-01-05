package com.jakefinance.financeapp.controller;

import com.jakefinance.financeapp.model.User;
import com.jakefinance.financeapp.service.AuthService;
import com.jakefinance.financeapp.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String password = userData.get("password");
        String firstName = userData.get("firstName");
        String lastName = userData.get("lastName");

        try {
            User newUser = authService.register(email, password, firstName, lastName);
            String newUserFirstName = newUser.getFirstName();
            System.out.println("Register - New user firstName: " + newUserFirstName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("email", newUser.getEmail());
            response.put("firstName", (newUserFirstName != null && !newUserFirstName.trim().isEmpty()) ? newUserFirstName.trim() : "");
            
            System.out.println("Register - Response map: " + response);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String password = userData.get("password");

        try {
            User user = authService.login(email, password);

            // ✅ Generate JWT token
            String token = jwtService.generateToken(email);

            // ✅ Return it in response
            String userFirstName = user.getFirstName();
            System.out.println("=== BACKEND LOGIN DEBUG ===");
            System.out.println("Login - User object: " + user);
            System.out.println("Login - User firstName: " + userFirstName);
            System.out.println("Login - User firstName is null: " + (userFirstName == null));
            System.out.println("Login - User firstName isEmpty: " + (userFirstName != null && userFirstName.trim().isEmpty()));
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("email", user.getEmail());
            response.put("token", token);
            
            // Always include firstName, even if empty
            String firstNameValue = "";
            if (userFirstName != null && !userFirstName.trim().isEmpty()) {
                firstNameValue = userFirstName.trim();
            }
            response.put("firstName", firstNameValue);
            // Force include even if empty by using a non-null value
            if (firstNameValue == null) {
                response.put("firstName", "");
            }
            
            System.out.println("Login - firstNameValue being put: '" + firstNameValue + "'");
            System.out.println("Login - Response map size: " + response.size());
            System.out.println("Login - Response map keys: " + response.keySet());
            System.out.println("Login - Response map firstName: " + response.get("firstName"));
            System.out.println("=== END BACKEND LOGIN DEBUG ===");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
