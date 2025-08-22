package com.umd.springbootbackend.service;

import com.umd.springbootbackend.dto.LoginUserDto;
import com.umd.springbootbackend.dto.RegisterUserDto;
import com.umd.springbootbackend.dto.VerifyUserDto;
import com.umd.springbootbackend.model.SecurityUser;
import com.umd.springbootbackend.model.User;
import com.umd.springbootbackend.repo.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthenticationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public SecurityUser signup(RegisterUserDto input) {
        User user = new User();
        user.setUsername(input.getUsername());
        user.setEmail(input.getEmail());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setEnabled(false);

        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));

        User savedUser = userRepository.save(user);
        sendVerificationEmail(savedUser);
        return new SecurityUser(savedUser);

    }

    public SecurityUser authenticate(LoginUserDto input) {
        User user = userRepository.findByUsername(input.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found with username: " + input.getUsername()));

        if (!user.isEnabled()) {
            throw new RuntimeException("User is not verified");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getUsername(),
                        input.getPassword()
                )
        );
        return new SecurityUser(user);
    }

    public void verifyUser(VerifyUserDto input) {
        Optional<User> optionalUser = userRepository.findByEmail(input.getEmail());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            // Check if verification code is expired
            if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Verification code expired");
            }
            // Check if the verification code matches
            if (user.getVerificationCode().equals(input.getVerificationCode())) {
                user.setEnabled(true);
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                userRepository.save(user);
            } else {
                throw new RuntimeException("Invalid verification code");
            }
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public void resendVerificationCode(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.isEnabled()) {
                throw new RuntimeException("User is already verified");
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            sendVerificationEmail(user);
        } else {
            throw new RuntimeException("User not found with email: " + email);
        }
    }

    public void sendVerificationEmail(User user) {
        String subject = "Account verification";
        String verificationCode = "VERIFICATION_CODE " + user.getVerificationCode();
        String body = "Please verify your account using the following code: " + verificationCode +
                "\nThis code is valid for 10 minutes.";
        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, body);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(999999);
        return String.format("%06d", code); // Ensure the code is 6 digits
    }
}
