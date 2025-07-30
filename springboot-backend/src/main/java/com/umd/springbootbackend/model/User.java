package com.umd.springbootbackend.model;

import jakarta.persistence.Entity;

@Entity
public class User {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
}
