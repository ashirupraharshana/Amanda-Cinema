package com.amanda.cinema.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import com.amanda.cinema.model.User;
import com.amanda.cinema.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OAuth2LoginSuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = authToken.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");

        // Find or create user
        Optional<User> existing = userRepository.findByEmail(email);
        User user;

        if (existing.isEmpty()) {
            user = new User(email, name, "CUSTOMER", "GOOGLE");
            userRepository.save(user);
        } else {
            user = existing.get();
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user);

        // Redirect to frontend with token (note: using /callback not /auth/callback because of route group)
        response.sendRedirect("http://localhost:3000/callback?token=" + token);
    }
}