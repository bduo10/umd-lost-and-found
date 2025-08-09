package com.umd.springbootbackend.service;
import com.umd.springbootbackend.model.Post;
import com.umd.springbootbackend.repo.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {
    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

   public List<Post> getAllPosts() {
        return postRepository.findAll();
   }

   public Post getPostById(Integer id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
   }

   public Post createPost(Post post, MultipartFile image) {
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

   public Post updatePost(Integer id, Post postDetails) {
        Post post = getPostById(id);
        post.setContent(postDetails.getContent());
        post.setAuthor(postDetails.getAuthor());
        post.setItemType(postDetails.getItemType());
        return postRepository.save(post);
   }

   public void deletePost(Integer id) {
        postRepository.deleteById(id);
   }


}
