package com.umd.springbootbackend.controller;

import com.umd.springbootbackend.dto.PostDto;
import com.umd.springbootbackend.model.ItemType;
import com.umd.springbootbackend.model.Post;
import com.umd.springbootbackend.model.SecurityUser;
import com.umd.springbootbackend.model.User;
import com.umd.springbootbackend.service.PostService;
import com.umd.springbootbackend.service.UserService;

import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
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
        List<PostDto> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable Integer userId) {
        try {
            List<Post> posts = postService.getPostsByUserId(userId);
            return ResponseEntity.ok(posts);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/type/{itemType}")
    public ResponseEntity<List<Post>> getPostsByItemType(@PathVariable String itemType) {
        try { 
            List<Post> posts = postService.getPostsByItemType(itemType);
            return ResponseEntity.ok(posts);
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
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create post"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(
        @PathVariable Integer id, 
        @RequestBody Integer userId,
        @RequestBody Post postDetails) {
        try {
            if (!postService.isPostOwner(id, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Post updatedPost = postService.updatePost(id, postDetails, userId);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/image")
    public ResponseEntity<Post> updatePostWithImage(
        @PathVariable Integer id,
        @RequestBody Integer userId, 
        @RequestParam("itemType") String itemType,
        @RequestParam("content") String content,
        @RequestParam(value="image", required=false) MultipartFile imageFile) {
        
        try {
            if (!postService.isPostOwner(id, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Post postDetails = new Post();
            postDetails.setItemType(ItemType.valueOf(itemType));
            postDetails.setContent(content);
            Post updatedPost = postService.updatePostWithImage(id, postDetails, userId, imageFile);
            return ResponseEntity.ok(updatedPost);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    } 

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Integer id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

}
