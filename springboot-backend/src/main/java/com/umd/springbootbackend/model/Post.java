package com.umd.springbootbackend.model;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Post {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;
    @Enumerated(EnumType.STRING)
    private ItemType itemType;
    private String content;
    private String author;


    public Post() {
    }

    public Post(
            Integer id,
            ItemType itemType,
            String content,
            String author) {
        this.id = id;
        this.itemType = itemType;
        this.content = content;
        this.author = author;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Post post)) return false;
        return Objects.equals(id, post.id) &&
                itemType == post.itemType &&
                Objects.equals(content, post.content) &&
                Objects.equals(author, post.author);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, itemType, content, author);
    }

}
