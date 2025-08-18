package com.umd.springbootbackend.service;
import com.umd.springbootbackend.model.ItemType;
import com.umd.springbootbackend.model.Post;
import com.umd.springbootbackend.model.User;
import com.umd.springbootbackend.repo.PostRepository;
import com.umd.springbootbackend.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

   public List<Post> getAllPosts() {
        return postRepository.findAll();
   }

   public Post getPostById(Integer id, Integer userId) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
   }

   public Post createPost(Post post, Integer userId, MultipartFile image) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        post.setUser(user);

        if (image != null && !image.isEmpty()) {
            try {
                post.setImage(image.getBytes());
                post.setImageType(image.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Failed to store image file", e);
            }
        }
        return postRepository.save(post);
   }

   public Post updatePost(Integer id, Post postDetails, Integer userId) {
        Post post = getPostById(id, userId);
        post.setContent(postDetails.getContent());
        post.setItemType(postDetails.getItemType());
        return postRepository.save(post);
   }

   public void deletePost(Integer id) {
        postRepository.deleteById(id);
   }

   // Get posts by user ID
   public List<Post> getPostsByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return postRepository.findByUser(user);
   }

   // Get posts by item type
   public List<Post> getPostsByItemType(String itemType) {
        try {
            ItemType type = ItemType.valueOf(itemType.toUpperCase());
            return postRepository.findByItemType(type);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid item type: " + itemType);
        }
   }

   // Update post with image
   public Post updatePostWithImage(Integer id, Post postDetails, Integer userId, MultipartFile image) {
        Post post = getPostById(id, userId);
        post.setContent(postDetails.getContent());
        post.setItemType(postDetails.getItemType());
        
        if (image != null && !image.isEmpty()) {
            try {
                post.setImage(image.getBytes());
                post.setImageType(image.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Failed to store image file", e);
            }
        }
        return postRepository.save(post);
   }

   // Check if user owns the post
   public boolean isPostOwner(Integer postId, Integer userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        return post.getUser().getId().equals(userId);
   }
}
