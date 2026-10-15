package com.swiftmt.app.service;

import com.swiftmt.app.config.JwtUtil;
import com.swiftmt.app.dto.LoginRequest;
import com.swiftmt.app.dto.LoginResponse;
import com.swiftmt.app.entity.User;
import com.swiftmt.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new BadCredentialsException("User not found"));

            String token = jwtUtil.generateToken(username, user.getRole());

            return new LoginResponse(
                    token,
                    user.getUsername(),
                    user.getFullName(),
                    user.getRole(),
                    jwtUtil.getExpiration()
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }
}
