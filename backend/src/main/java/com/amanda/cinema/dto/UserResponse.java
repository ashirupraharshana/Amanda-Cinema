package com.amanda.cinema.dto;

public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private String role;
    private String provider;

    public UserResponse() {
    }

    public UserResponse(Long id, String email, String name, String role, String provider) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.provider = provider;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public String getProvider() {
        return provider;
    }
}