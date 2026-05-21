package com.amanda.cinema.controller;

import com.amanda.cinema.dto.UserResponse;
import com.amanda.cinema.dto.UserUpdateRequest;
import com.amanda.cinema.model.User;
import com.amanda.cinema.repository.UserRepository;
import com.amanda.cinema.service.AdminUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {

    private final UserRepository userRepository;
    private final AdminUserService adminUserService;

    public AdminController(UserRepository userRepository,
                           AdminUserService adminUserService) {
        this.userRepository = userRepository;
        this.adminUserService = adminUserService;
    }

    private ResponseEntity<Map<String, String>> checkAdminAccess(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        User currentUser = (User) authentication.getPrincipal();

        if (!"ADMIN".equals(currentUser.getRole())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Access denied. Admin privileges required.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        return null;
    }

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        ResponseEntity<Map<String, String>> accessError = checkAdminAccess(authentication);

        if (accessError != null) {
            return accessError;
        }

        try {
            List<UserResponse> users = adminUserService.getAllUsers();
            return ResponseEntity.ok(users);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get one user by id
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId,
                                         Authentication authentication) {
        ResponseEntity<Map<String, String>> accessError = checkAdminAccess(authentication);

        if (accessError != null) {
            return accessError;
        }

        try {
            UserResponse user = adminUserService.getUserById(userId);
            return ResponseEntity.ok(user);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Update user details
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId,
                                        @RequestBody UserUpdateRequest request,
                                        Authentication authentication) {
        ResponseEntity<Map<String, String>> accessError = checkAdminAccess(authentication);

        if (accessError != null) {
            return accessError;
        }

        try {
            UserResponse updatedUser = adminUserService.updateUser(userId, request);
            return ResponseEntity.ok(updatedUser);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Update only user role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId,
                                            @RequestBody Map<String, String> request,
                                            Authentication authentication) {
        ResponseEntity<Map<String, String>> accessError = checkAdminAccess(authentication);

        if (accessError != null) {
            return accessError;
        }

        try {
            String role = request.get("role");
            UserResponse updatedUser = adminUserService.updateUserRole(userId, role);
            return ResponseEntity.ok(updatedUser);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Delete user
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId,
                                        Authentication authentication) {
        ResponseEntity<Map<String, String>> accessError = checkAdminAccess(authentication);

        if (accessError != null) {
            return accessError;
        }

        try {
            User currentUser = (User) authentication.getPrincipal();

            if (currentUser.getId().equals(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You cannot delete your own logged-in admin account.");
                return ResponseEntity.badRequest().body(error);
            }

            adminUserService.deleteUser(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Admin dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        ResponseEntity<Map<String, String>> accessError = checkAdminAccess(authentication);

        if (accessError != null) {
            return accessError;
        }

        try {
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