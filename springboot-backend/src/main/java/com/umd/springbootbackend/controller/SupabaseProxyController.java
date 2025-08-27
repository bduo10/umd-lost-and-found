package com.umd.springbootbackend.controller;

import com.umd.springbootbackend.dto.MessageDto;
import com.umd.springbootbackend.model.SecurityUser;
import com.umd.springbootbackend.service.SupabaseProxyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/supabase")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class SupabaseProxyController {

    private final SupabaseProxyService supabaseProxyService;

    public SupabaseProxyController(SupabaseProxyService supabaseProxyService) {
        this.supabaseProxyService = supabaseProxyService;
    }

    @PostMapping("/messages")
    public ResponseEntity<?> createMessage(
            @RequestBody MessageDto messageDto,
            Authentication authentication) {
        try {
            Long currentUserId = getCurrentUserId(authentication);
            messageDto.setSenderId(currentUserId); // Ensure sender is current user
            
            MessageDto createdMessage = supabaseProxyService.createMessage(messageDto);
            return ResponseEntity.ok(createdMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(
            @RequestParam Long conversationUserId,
            Authentication authentication) {
        try {
            Long currentUserId = getCurrentUserId(authentication);
            System.out.println("=== GET MESSAGES REQUEST ===");
            System.out.println("Current User ID: " + currentUserId);
            System.out.println("Conversation User ID: " + conversationUserId);
            
            List<MessageDto> messages = supabaseProxyService.getMessages(currentUserId, conversationUserId);
            System.out.println("Controller: Found " + messages.size() + " messages");
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Controller error in getMessages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/messages/{messageId}/read")
    public ResponseEntity<?> markMessageAsRead(
            @PathVariable Long messageId,
            Authentication authentication) {
        try {
            Long currentUserId = getCurrentUserId(authentication);
            supabaseProxyService.markMessageAsRead(messageId, currentUserId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication authentication) {
        try {
            Long currentUserId = getCurrentUserId(authentication);
            List<Map<String, Object>> conversations = supabaseProxyService.getConversations(currentUserId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("User not authenticated");
        }
        
        // Get user ID from SecurityUser principal
        if (authentication.getPrincipal() instanceof SecurityUser) {
            SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
            return securityUser.getId().longValue();
        }
        
        throw new RuntimeException("Invalid authentication principal type");
    }
}
