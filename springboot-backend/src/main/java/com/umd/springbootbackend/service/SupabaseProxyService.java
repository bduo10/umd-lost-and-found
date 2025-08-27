package com.umd.springbootbackend.service;

import com.umd.springbootbackend.dto.MessageDto;
import com.umd.springbootbackend.model.User;
import com.umd.springbootbackend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class SupabaseProxyService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service.key}")
    private String supabaseServiceKey;

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;

    public SupabaseProxyService(UserRepository userRepository) {
        this.restTemplate = new RestTemplate();
        this.userRepository = userRepository;
    }

    public MessageDto createMessage(MessageDto messageDto) {
        String url = supabaseUrl + "/rest/v1/messages";
        
        HttpHeaders headers = createHeaders();
        headers.set("Prefer", "return=representation");
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("sender_id", messageDto.getSenderId());
        requestBody.put("receiver_id", messageDto.getReceiverId());
        requestBody.put("content", messageDto.getContent());
        requestBody.put("is_read", false);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Object[]> response = restTemplate.postForEntity(url, request, Object[].class);
            
            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null && response.getBody().length > 0) {
                Map<String, Object> createdMessage = (Map<String, Object>) response.getBody()[0];
                return mapToMessageDto(createdMessage);
            } else {
                throw new RuntimeException("Failed to create message");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error creating message: " + e.getMessage(), e);
        }
    }

    public List<MessageDto> getMessages(Long currentUserId, Long conversationUserId) {
        // Try a simpler query first to debug
        String url = supabaseUrl + "/rest/v1/messages" +
                "?or=(sender_id.eq." + currentUserId + ",receiver_id.eq." + currentUserId + ")" +
                "&order=created_at.asc";
        
        System.out.println("=== FETCHING MESSAGES FROM SUPABASE ===");
        System.out.println("Current User ID: " + currentUserId);
        System.out.println("Conversation User ID: " + conversationUserId);
        System.out.println("Simplified Supabase URL: " + url);
        System.out.println("(Note: Fetching ALL messages for user " + currentUserId + " for debugging)");
        
        HttpHeaders headers = createHeaders();
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<Object[]> response = restTemplate.exchange(url, HttpMethod.GET, request, Object[].class);
            
            System.out.println("Supabase response status: " + response.getStatusCode());
            System.out.println("Supabase response body length: " + (response.getBody() != null ? response.getBody().length : "null"));
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<MessageDto> messages = new ArrayList<>();
                for (Object messageObj : response.getBody()) {
                    Map<String, Object> messageMap = (Map<String, Object>) messageObj;
                    MessageDto dto = mapToMessageDto(messageMap);
                    
                    // Filter messages to only include conversation with conversationUserId
                    if ((dto.getSenderId().equals(currentUserId) && dto.getReceiverId().equals(conversationUserId)) ||
                        (dto.getSenderId().equals(conversationUserId) && dto.getReceiverId().equals(currentUserId))) {
                        messages.add(dto);
                        System.out.println("Included message: " + dto.getId() + " - " + dto.getContent());
                    } else {
                        System.out.println("Excluded message: " + dto.getId() + " (not part of this conversation)");
                    }
                }
                System.out.println("Total messages found for conversation: " + messages.size());
                return messages;
            } else {
                System.err.println("Failed to fetch messages - Status: " + response.getStatusCode());
                throw new RuntimeException("Failed to fetch messages");
            }
        } catch (Exception e) {
            System.err.println("Error fetching messages: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching messages: " + e.getMessage(), e);
        }
    }

    public void markMessageAsRead(Long messageId, Long currentUserId) {
        // First verify the current user is the receiver of this message
        String checkUrl = supabaseUrl + "/rest/v1/messages?id=eq." + messageId + "&receiver_id=eq." + currentUserId;
        
        HttpHeaders headers = createHeaders();
        HttpEntity<String> checkRequest = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<Object[]> checkResponse = restTemplate.exchange(checkUrl, HttpMethod.GET, checkRequest, Object[].class);
            
            if (checkResponse.getBody() == null || checkResponse.getBody().length == 0) {
                throw new RuntimeException("Message not found or user not authorized to mark as read");
            }
            
            // Update the message
            String updateUrl = supabaseUrl + "/rest/v1/messages?id=eq." + messageId;
            
            Map<String, Object> updateBody = new HashMap<>();
            updateBody.put("is_read", true);
            
            HttpEntity<Map<String, Object>> updateRequest = new HttpEntity<>(updateBody, headers);
            
            ResponseEntity<String> updateResponse = restTemplate.exchange(updateUrl, HttpMethod.PATCH, updateRequest, String.class);
            
            if (!updateResponse.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to mark message as read");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error marking message as read: " + e.getMessage(), e);
        }
    }

    public List<Map<String, Object>> getConversations(Long currentUserId) {
        String url = supabaseUrl + "/rest/v1/messages" +
                "?or=(sender_id.eq." + currentUserId + ",receiver_id.eq." + currentUserId + ")" +
                "&order=created_at.desc";
        
        HttpHeaders headers = createHeaders();
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<Object[]> response = restTemplate.exchange(url, HttpMethod.GET, request, Object[].class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<Long, Map<String, Object>> conversationMap = new HashMap<>();
                
                for (Object messageObj : response.getBody()) {
                    Map<String, Object> message = (Map<String, Object>) messageObj;
                    Long senderId = Long.valueOf(message.get("sender_id").toString());
                    Long receiverId = Long.valueOf(message.get("receiver_id").toString());
                    
                    Long otherUserId = senderId.equals(currentUserId) ? receiverId : senderId;
                    
                    if (!conversationMap.containsKey(otherUserId)) {
                        // Get the other user's name from the database
                        String otherUserName = "Unknown User"; // Default value
                        try {
                            User otherUser = userRepository.findById(otherUserId.intValue()).orElse(null);
                            if (otherUser != null) {
                                otherUserName = otherUser.getUsername();
                            }
                        } catch (Exception e) {
                            System.err.println("Error fetching user name for ID " + otherUserId + ": " + e.getMessage());
                        }
                        
                        Map<String, Object> conversation = new HashMap<>();
                        conversation.put("id", otherUserId.toString()); // Add missing id field
                        conversation.put("other_user_id", otherUserId);
                        conversation.put("other_user_name", otherUserName); // Fix: Add missing user name
                        conversation.put("last_message", message.get("content"));
                        conversation.put("last_message_time", message.get("created_at"));
                        conversation.put("unread_count", 0); // We'll calculate this if needed
                        conversation.put("post_id", null); // Add missing post_id field
                        conversationMap.put(otherUserId, conversation);
                    }
                }
                
                return new ArrayList<>(conversationMap.values());
            } else {
                return new ArrayList<>();
            }
        } catch (Exception e) {
            throw new RuntimeException("Error fetching conversations: " + e.getMessage(), e);
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + supabaseServiceKey);
        headers.set("apikey", supabaseServiceKey);
        return headers;
    }

    private MessageDto mapToMessageDto(Map<String, Object> messageMap) {
        MessageDto dto = new MessageDto();
        dto.setId(Long.valueOf(messageMap.get("id").toString()));
        dto.setSenderId(Long.valueOf(messageMap.get("sender_id").toString()));
        dto.setReceiverId(Long.valueOf(messageMap.get("receiver_id").toString()));
        dto.setContent((String) messageMap.get("content"));
        dto.setIsRead((Boolean) messageMap.get("is_read"));
        
        // Handle created_at timestamp from Supabase (ISO 8601 with timezone)
        Object createdAt = messageMap.get("created_at");
        if (createdAt != null) {
            try {
                String timestampStr = createdAt.toString();
                System.out.println("Parsing timestamp: " + timestampStr);
                
                // Parse ISO 8601 timestamp with timezone and convert to LocalDateTime
                java.time.OffsetDateTime offsetDateTime = java.time.OffsetDateTime.parse(timestampStr);
                dto.setCreatedAt(offsetDateTime.toLocalDateTime());
                
                System.out.println("Parsed timestamp successfully: " + dto.getCreatedAt());
            } catch (Exception e) {
                System.err.println("Error parsing timestamp '" + createdAt + "': " + e.getMessage());
                // Fallback to current time if parsing fails
                dto.setCreatedAt(java.time.LocalDateTime.now());
            }
        }
        
        return dto;
    }
}
