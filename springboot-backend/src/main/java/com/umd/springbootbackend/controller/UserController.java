package com.umd.springbootbackend.controller;

import com.umd.springbootbackend.dto.UserDto;
import com.umd.springbootbackend.model.SecurityUser;
import com.umd.springbootbackend.model.User;
import com.umd.springbootbackend.service.UserService;
import com.umd.springbootbackend.service.SupabaseProxyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Cookie;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final SupabaseProxyService supabaseProxyService;

    public UserController(UserService userService, SupabaseProxyService supabaseProxyService) {
        this.userService = userService;
        this.supabaseProxyService = supabaseProxyService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        User currUser = userService.getUserByUsername(securityUser.getUsername());
        
        if (currUser == null) {
            logger.warn("User not found for username: {}", securityUser.getUsername());
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

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteCurrentUser(HttpServletRequest request, HttpServletResponse response) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUser)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not authenticated");
            }
            
            SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
            Integer userId = securityUser.getId();
            
            // Delete all messages where this user is sender or receiver
            supabaseProxyService.deleteUserMessages(userId.longValue());
            
            // Delete the user (posts will be cascade deleted automatically)
            userService.deleteUser(userId);
            
            // Clear the session and invalidate authentication cookie
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            
            // Clear the security context
            SecurityContextHolder.clearContext();
            
            // Clear the JWT authentication cookie (this is the key fix!)
            Cookie authCookie = new Cookie("auth-token", null);
            authCookie.setPath("/");
            authCookie.setHttpOnly(true);
            authCookie.setSecure(true); // Set to true in production with HTTPS
            authCookie.setMaxAge(0);
            response.addCookie(authCookie);
            
            // Also clear JSESSIONID just in case
            Cookie sessionCookie = new Cookie("JSESSIONID", null);
            sessionCookie.setPath("/");
            sessionCookie.setHttpOnly(true);
            sessionCookie.setMaxAge(0);
            response.addCookie(sessionCookie);
            
            return ResponseEntity.ok("User account deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting user account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete user account");
        }
    }
}
