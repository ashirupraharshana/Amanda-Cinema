package com.amanda.cinema.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.amanda.cinema.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
