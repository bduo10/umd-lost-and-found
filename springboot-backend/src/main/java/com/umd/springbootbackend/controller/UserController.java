package com.umd.springbootbackend.controller;

import com.umd.springbootbackend.dto.UserDto;
import com.umd.springbootbackend.model.SecurityUser;
import com.umd.springbootbackend.model.User;
import com.umd.springbootbackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        User currUser = userService.getUserByUsername(securityUser.getUsername());
        if (currUser == null) {
            return ResponseEntity.notFound().build();
        }
        UserDto userDto = new UserDto(
                currUser.getId(),
                currUser.getEmail(),
                currUser.getUsername()
        );
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        UserDto userDto = new UserDto(
                user.getId(),
                user.getEmail(),
                user.getUsername()
        );
        return ResponseEntity.ok(userDto);
    }
}
