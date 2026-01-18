package com.amanda.cinema.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    private String role;   // ADMIN / CUSTOMER

    private String provider; // GOOGLE / LOCAL

    @Column(nullable = true)
    private String password;


    // Constructors
    public User() {}

    public User(String email, String name, String role, String provider) {
        this.email = email;
        this.name = name;
        this.role = role;
        this.provider = provider;
    }

    // Getters & Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

}
