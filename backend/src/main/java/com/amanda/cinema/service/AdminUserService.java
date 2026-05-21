package com.amanda.cinema.service;

import com.amanda.cinema.dto.UserResponse;
import com.amanda.cinema.dto.UserUpdateRequest;
import com.amanda.cinema.model.Booking;
import com.amanda.cinema.model.User;
import com.amanda.cinema.repository.BookingRepository;
import com.amanda.cinema.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public AdminUserService(UserRepository userRepository,
                            BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();

            if (!newEmail.equalsIgnoreCase(user.getEmail())
                    && userRepository.existsByEmail(newEmail)) {
                throw new RuntimeException("Email already exists");
            }

            user.setEmail(newEmail);
        }

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            user.setRole(validateRole(request.getRole()));
        }

        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(validateRole(role));

        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));


        List<Booking> userBookings = bookingRepository.findByUserId(userId);

        if (!userBookings.isEmpty()) {
            bookingRepository.deleteAll(userBookings);
        }

        userRepository.delete(user);
    }

    private String validateRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            throw new RuntimeException("Role is required");
        }

        String cleanRole = role.trim().toUpperCase(Locale.ROOT);

        if (!cleanRole.equals("ADMIN") && !cleanRole.equals("CUSTOMER")) {
            throw new RuntimeException("Invalid role. Role must be ADMIN or CUSTOMER");
        }

        return cleanRole;
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getProvider()
        );
    }
}