package com.umd.springbootbackend.controller;

import com.umd.springbootbackend.dto.UserDto;
import com.umd.springbootbackend.model.SecurityUser;
import com.umd.springbootbackend.model.User;
import com.umd.springbootbackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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

    @PostMapping("/by-ids")
    public ResponseEntity<List<UserDto>> getUsersByIds(@RequestBody List<Long> userIds) {
        List<User> users = userService.getUsersByIds(userIds);
        List<UserDto> userDtos = users.stream()
                .map(user -> new UserDto(
                        user.getId(),
                        user.getEmail(),
                        user.getUsername()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }
}
