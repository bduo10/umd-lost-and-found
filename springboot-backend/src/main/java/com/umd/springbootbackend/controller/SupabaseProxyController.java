package com.umd.springbootbackend.controller;

import com.umd.springbootbackend.dto.MessageDto;
import com.umd.springbootbackend.model.SecurityUser;
import com.umd.springbootbackend.service.SupabaseProxyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/supabase")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class SupabaseProxyController {

    private static final Logger logger = LoggerFactory.getLogger(SupabaseProxyController.class);
    
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
            logger.error("Error creating message", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create message"));
        }
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(
            @RequestParam Long conversationUserId,
            Authentication authentication) {
        try {
            Long currentUserId = getCurrentUserId(authentication);
            logger.debug("Retrieving messages for conversation");
            
            List<MessageDto> messages = supabaseProxyService.getMessages(currentUserId, conversationUserId);
            logger.debug("Retrieved {} messages", messages.size());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            logger.error("Error retrieving messages", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to retrieve messages"));
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
            logger.error("Error marking message as read", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to mark message as read"));
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication authentication) {
        try {
            Long currentUserId = getCurrentUserId(authentication);
            List<Map<String, Object>> conversations = supabaseProxyService.getConversations(currentUserId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            logger.error("Error retrieving conversations", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to retrieve conversations"));
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
