package com.umd.springbootbackend.service;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.umd.springbootbackend.repo.UserRepository;
import com.umd.springbootbackend.model.User;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")); // ✅ Generic message
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")); // ✅ Generic message
    }

    public List<User> getUsersByIds(List<Long> userIds) {
        return userRepository.findAllById(userIds.stream().map(Long::intValue).toList());
    }

    public void deleteUser(Integer userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        User user = getUserById(userId); // This throws exception if not found
        userRepository.delete(user);
    }

    public void deleteUserByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid username");
        }
        User user = getUserByUsername(username); // This throws exception if not found
        userRepository.delete(user);
    }
}
