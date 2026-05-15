package com.amanda.cinema.controller;

import com.amanda.cinema.model.User;
import com.amanda.cinema.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // user profile
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User u = opt.get();
        return ResponseEntity.ok(Map.of(
                "id",       u.getId(),
                "name",     u.getName()  != null ? u.getName()  : "",
                "email",    u.getEmail() != null ? u.getEmail() : "",
                "role",     u.getRole()  != null ? u.getRole()  : "",
                "hasPassword", u.getPassword() != null
        ));
    }

    // update name only
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody Map<String, String> body) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User u = opt.get();

        String newName = body.get("name");
        if (newName != null && !newName.isBlank()) {
            u.setName(newName.trim());
        }

        userRepository.save(u);

        return ResponseEntity.ok(Map.of(
                "id",    u.getId(),
                "name",  u.getName()  != null ? u.getName()  : "",
                "email", u.getEmail() != null ? u.getEmail() : "",
                "role",  u.getRole()  != null ? u.getRole()  : "",
                "hasPassword", u.getPassword() != null
        ));
    }

    //  change password
    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id,
                                            @RequestBody Map<String, String> body) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String currentPassword = body.get("currentPassword");
        String newPassword     = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Both currentPassword and newPassword are required"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "New password must be at least 6 characters"));
        }

        User u = opt.get();

        if (u.getPassword() != null && !passwordEncoder.matches(currentPassword, u.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Current password is incorrect"));
        }

        u.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(u);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}