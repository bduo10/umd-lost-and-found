package com.umd.springbootbackend.dto;

public class PostCreateDto {
    private String itemType;
    private String content;
    private Integer userId;

    public PostCreateDto() {}

    public PostCreateDto(String itemType, String content, Integer userId) {
        this.itemType = itemType;
        this.content = content;
        this.userId = userId;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}