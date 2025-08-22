package com.umd.springbootbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {
    private Integer id;
    private String email;
    private String username;

    public UserDto(Integer id, String email, String username) {
        this.id = id;
        this.email = email;
        this.username = username;
    }
}
