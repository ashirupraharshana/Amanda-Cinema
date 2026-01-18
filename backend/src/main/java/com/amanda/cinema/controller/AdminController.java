package com.amanda.cinema.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.amanda.cinema.model.User;
import com.amanda.cinema.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users (admin only)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        try {
            // Check if user is authenticated
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Get authenticated user
            User currentUser = (User) authentication.getPrincipal();

            // Check if user is admin
            if (!"ADMIN".equals(currentUser.getRole())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin privileges required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get dashboard stats (admin only)
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        try {
            // Check if user is authenticated
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Get authenticated user
            User currentUser = (User) authentication.getPrincipal();

            // Check if user is admin
            if (!"ADMIN".equals(currentUser.getRole())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin privileges required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userRepository.count());
            stats.put("message", "Admin dashboard data");
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch dashboard data: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}