package com.umd.springbootbackend.controller;

import com.umd.springbootbackend.dto.PostDto;
import com.umd.springbootbackend.model.ItemType;
import com.umd.springbootbackend.model.Post;
import com.umd.springbootbackend.model.SecurityUser;
import com.umd.springbootbackend.model.User;
import com.umd.springbootbackend.service.PostService;
import com.umd.springbootbackend.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
    private static final Logger logger = LoggerFactory.getLogger(PostController.class);
    private final PostService postService;
    private final UserService userService;

    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    private User getCurrUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }
        SecurityUser securityUser = (SecurityUser) auth.getPrincipal();
        return userService.getUserById(securityUser.getId());
    }

    @GetMapping("/all")
    public ResponseEntity<List<PostDto>> getAllPosts() {
        logger.info("getAllPosts() called");
        try {
            List<PostDto> posts = postService.getAllPosts();
            logger.info("getAllPosts() returning {} posts", posts.size());
            logger.info("First few posts: {}", posts.stream().limit(2).toList());
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error in getAllPosts()", e);
            throw e;
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<PostDto>> getPostsByUserId(@PathVariable String username) {
        try {
            List<PostDto> posts = postService.getPostsByUsername(username);
            return ResponseEntity.ok(posts);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/type/{itemType}")
    public ResponseEntity<List<PostDto>> getPostsByItemType(@PathVariable String itemType) {
        try { 
            List<Post> posts = postService.getPostsByItemType(itemType);
            List<PostDto> postDtos = posts.stream()
                .map(post -> new PostDto(
                    post.getId(),
                    post.getUser().getId(),
                    post.getUser().getUsername(),
                    post.getItemType().name(),
                    post.getContent(),
                    post.getImage() != null && post.getImage().length > 0
                ))
                .collect(Collectors.toList());
            return ResponseEntity.ok(postDtos);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImageById(@PathVariable Integer id) {
        Post post = postService.getPostById(id);
        if (post.getImage() != null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(post.getImageType()))
                    .body(post.getImage());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(
            @RequestParam("itemType") String itemType,
            @RequestParam("content") String content,
            @RequestParam(value="image", required=false) MultipartFile imageFile
    ) {
                
        User currUser = getCurrUser();
        Integer userId = currUser.getId();

        ItemType itemTypeEnum;
        try {
            itemTypeEnum = ItemType.valueOf(itemType);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid item type: " + itemType));
        }

        Post post = new Post();
        post.setItemType(itemTypeEnum);
        post.setContent(content);
        try {
            Post createdPost = postService.createPost(post, userId, imageFile);
            PostDto postDto = new PostDto(
                createdPost.getId(),
                createdPost.getUser().getId(),
                createdPost.getUser().getUsername(),
                createdPost.getItemType().name(),
                createdPost.getContent(),
                createdPost.getImage() != null && createdPost.getImage().length > 0
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(postDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create post"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDto> updatePost(
        @PathVariable Integer id, 
        @RequestBody Post postDetails) {
        try {
            User currentUser = getCurrUser();
            if (!postService.isPostOwner(id, currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Post updatedPost = postService.updatePost(id, postDetails, currentUser.getId());
            PostDto postDto = new PostDto(
                updatedPost.getId(),
                updatedPost.getUser().getId(),
                updatedPost.getUser().getUsername(),
                updatedPost.getItemType().name(),
                updatedPost.getContent(),
                updatedPost.getImage() != null && updatedPost.getImage().length > 0
            );
            return ResponseEntity.ok(postDto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/image")
    public ResponseEntity<PostDto> updatePostWithImage(
        @PathVariable Integer id,
        @RequestParam("itemType") String itemType,
        @RequestParam("content") String content,
        @RequestParam(value="image", required=false) MultipartFile imageFile) {
        
        try {
            User currentUser = getCurrUser();
            if (!postService.isPostOwner(id, currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Post postDetails = new Post();
            postDetails.setItemType(ItemType.valueOf(itemType));
            postDetails.setContent(content);
            Post updatedPost = postService.updatePostWithImage(id, postDetails, currentUser.getId(), imageFile);
            
            PostDto postDto = new PostDto(
                updatedPost.getId(),
                updatedPost.getUser().getId(),
                updatedPost.getUser().getUsername(),
                updatedPost.getItemType().name(),
                updatedPost.getContent(),
                updatedPost.getImage() != null && updatedPost.getImage().length > 0
            );
            return ResponseEntity.ok(postDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    } 

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Integer id) {
        try {
            User currentUser = getCurrUser();
            if (!postService.isPostOwner(id, currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            postService.deletePost(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
