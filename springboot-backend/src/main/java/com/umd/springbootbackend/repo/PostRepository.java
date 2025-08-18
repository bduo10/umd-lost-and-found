package com.umd.springbootbackend.repo;

import com.umd.springbootbackend.model.ItemType;
import com.umd.springbootbackend.model.Post;
import com.umd.springbootbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    List<Post> findByUser(User user);
    List<Post> findByItemType(ItemType itemType);
    List<Post> findByUserId(Integer userId);
}
