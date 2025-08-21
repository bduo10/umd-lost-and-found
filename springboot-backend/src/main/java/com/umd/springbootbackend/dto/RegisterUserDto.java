package com.umd.springbootbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserDto {
    private String email;
    private String userName;
    private String password;
}
