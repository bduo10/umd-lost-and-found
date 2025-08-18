package com.umd.springbootbackend.service;

import org.springframework.stereotype.Service;
import com.umd.springbootbackend.repo.UserRepository;
import com.umd.springbootbackend.model.User;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    } 
}
