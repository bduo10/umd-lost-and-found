package com.umd.springbootbackend.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class PostDto {
    private Integer id;
    private String itemType;
    private String content;
    private String username;
    private boolean hasImage;

    public PostDto() {}

    public PostDto(Integer id, String username, String itemType, String content, boolean hasImage) {
        this.id = id;
        this.username = username;
        this.itemType = itemType;
        this.content = content;
        this.hasImage = hasImage;
    }
}