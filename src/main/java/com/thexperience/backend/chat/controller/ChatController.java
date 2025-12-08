package com.thexperience.backend.chat.controller;

import com.thexperience.backend.chat.dto.*;
import com.thexperience.backend.chat.entity.ChatMessageEntity;
import com.thexperience.backend.chat.repository.ChatMessageRepository;
import com.thexperience.backend.chat.service.OpenAIChatService;
import com.thexperience.backend.entities.UserEntity;
import com.thexperience.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat/cv-scorer")
public class ChatController {
    
    @Autowired
    private OpenAIChatService openAIChatService;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<?> sendMessage(
            @RequestBody ChatRequest request,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            UUID userId = getUserIdFromEmail(userEmail);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }
            
            // Get conversation history from database
            List<ChatMessageEntity> dbMessages = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
            
            // Build conversation history for OpenAI
            List<Map<String, String>> conversationHistory = dbMessages.stream()
                    .map(msg -> Map.of(
                            "role", msg.getRole(),
                            "content", msg.getContent()
                    ))
                    .collect(Collectors.toList());
            
            // Add conversation history from request (if provided, for immediate context)
            if (request.getConversationHistory() != null) {
                conversationHistory.addAll(request.getConversationHistory());
            }
            
            // Get response from OpenAI
            String assistantResponse = openAIChatService.getChatResponse(
                    request.getMessage(),
                    conversationHistory
            );
            
            // Save user message
            ChatMessageEntity userMessage = new ChatMessageEntity();
            userMessage.setUserId(userId);
            userMessage.setRole("user");
            userMessage.setContent(request.getMessage());
            chatMessageRepository.save(userMessage);
            
            // Save assistant response
            ChatMessageEntity assistantMessage = new ChatMessageEntity();
            assistantMessage.setUserId(userId);
            assistantMessage.setRole("assistant");
            assistantMessage.setContent(assistantResponse);
            chatMessageRepository.save(assistantMessage);
            
            return ResponseEntity.ok(new ChatResponse(assistantResponse));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process chat message: " + e.getMessage()));
        }
    }
    
    @GetMapping("/history")
    public ResponseEntity<?> getConversationHistory(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            UUID userId = getUserIdFromEmail(userEmail);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }
            
            List<ChatMessageEntity> messages = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
            
            List<MessageDTO> messageDTOs = messages.stream()
                    .map(msg -> new MessageDTO(
                            msg.getId(),
                            msg.getRole(),
                            msg.getContent(),
                            msg.getCreatedAt()
                    ))
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(new ConversationHistoryResponse(messageDTOs));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to load conversation history: " + e.getMessage()));
        }
    }
    
    /**
     * Gets user ID from email using UserRepository.
     */
    private UUID getUserIdFromEmail(String email) {
        if (email == null || email.isEmpty()) {
            return null;
        }
        
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return userOpt.get().getId();
        }
        
        return null;
    }
}
