package com.amanda.cinema.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.amanda.cinema.dto.LoginRequest;
import com.amanda.cinema.dto.RegisterRequest;
import com.amanda.cinema.model.User;
import com.amanda.cinema.repository.UserRepository;
import com.amanda.cinema.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // REGISTER
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest request) {

        Map<String, Object> response = new HashMap<>();

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            response.put("error", "Email already exists");
            return response;
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("CUSTOMER");
        user.setProvider("LOCAL");

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        response.put("message", "Registration successful");
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        return response;
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {

        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            response.put("error", "Invalid email or password");
            return response;
        }

        User user = userOpt.get();

        if (user.getPassword() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.put("error", "Invalid email or password");
            return response;
        }

        String token = jwtUtil.generateToken(user);

        response.put("message", "Login successful");
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        return response;
    }

    // TEST AUTH
    @GetMapping("/me")
    public Map<String, Object> me(@RequestHeader("Authorization") String authHeader) {

        Map<String, Object> response = new HashMap<>();

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        Long userId = jwtUtil.extractUserId(token);
        String role = jwtUtil.extractRole(token);
        String name = jwtUtil.extractName(token);

        response.put("userId", userId);
        response.put("email", email);
        response.put("role", role);
        response.put("name", name);
        response.put("message", "JWT authentication working");
        return response;
    }

    // ADMIN REGISTER
    @PostMapping("/admin/register")
    public Map<String, Object> adminRegister(@RequestBody RegisterRequest request) {

        Map<String, Object> response = new HashMap<>();

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            response.put("error", "Email already exists");
            return response;
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ADMIN");
        user.setProvider("LOCAL");

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        response.put("message", "Admin registration successful");
        response.put("token", token);
        response.put("role", "ADMIN");
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        return response;
    }

    // ADMIN LOGIN
    @PostMapping("/admin/login")
    public Map<String, Object> adminLogin(@RequestBody LoginRequest request) {

        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            response.put("error", "Invalid email or password");
            return response;
        }

        User user = userOpt.get();

        // Check if user is admin
        if (!"ADMIN".equals(user.getRole())) {
            response.put("error", "Access denied. Admin privileges required.");
            return response;
        }

        if (user.getPassword() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.put("error", "Invalid email or password");
            return response;
        }

        String token = jwtUtil.generateToken(user);

        response.put("message", "Admin login successful");
        response.put("token", token);
        response.put("role", "ADMIN");
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        return response;
    }
}