package com.umd.springbootbackend.controller;

import com.umd.springbootbackend.model.ItemType;
import com.umd.springbootbackend.model.Post;
import com.umd.springbootbackend.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    /*
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Integer id) {
        Post post = postService.getPostById(id);
        return ResponseEntity.ok(post);
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
    */ 

    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Post> createPost(
            @RequestParam("itemType") String itemType,
            @RequestParam("content") String content,
            @RequestParam("userId") Integer userId,
            @RequestParam(value="image", required=false) MultipartFile imageFile) {
        Post post = new Post();
        post.setItemType(ItemType.valueOf(itemType));
        post.setContent(content);
        try {
            Post createdPost = postService.createPost(post, userId, imageFile);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Integer id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

}
