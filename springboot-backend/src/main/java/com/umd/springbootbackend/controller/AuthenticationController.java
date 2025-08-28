package com.umd.springbootbackend.controller;

import com.umd.springbootbackend.dto.LoginUserDto;
import com.umd.springbootbackend.dto.RegisterUserDto;
import com.umd.springbootbackend.dto.VerifyUserDto;
import com.umd.springbootbackend.model.SecurityUser;
import com.umd.springbootbackend.service.AuthenticationService;
import com.umd.springbootbackend.service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> register(@RequestBody RegisterUserDto registerUserDto) {
        authenticationService.signup(registerUserDto);
        return ResponseEntity.ok("user registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> authenticate(
            @RequestBody LoginUserDto loginUserDto,
            HttpServletResponse response) {
        SecurityUser authenticatedUser = authenticationService.authenticate(loginUserDto);
        
        // Generate a standard JWT token for backend authentication (not Supabase-specific)
        String jwtToken = jwtService.generateToken(authenticatedUser);

        // Set HttpOnly cookie for secure authentication
        Cookie jwtCookie = new Cookie("auth-token", jwtToken);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge((int) jwtService.getExpirationTime() / 1000);
        jwtCookie.setAttribute("SameSite", "Strict");

        response.addCookie(jwtCookie);
        
        // Don't return JWT in response body for security (proxy pattern)
        return ResponseEntity.ok("Login successful");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        Cookie jwtCookie = new Cookie("auth-token", "");
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);
        jwtCookie.setAttribute("SameSite", "Strict");

        response.addCookie(jwtCookie);
        return ResponseEntity.ok("logout successful");
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerifyUserDto verifyUserDto) {
        try {
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity.ok("User verified successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendUser(@RequestParam String email) {
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code resent successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
}
