package com.umd.springbootbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String username;
    @Column(unique = true)
    private String email;
    @Column(nullable = false)
    @JsonIgnore // ✅ Prevent password from being serialized
    private String password;

    @OneToMany(mappedBy="user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Post> posts;

    @Column(name = "verification_code")
    @JsonIgnore // ✅ Hide verification codes
    private String verificationCode;
    @Column(name = "verification_expiration")
    @JsonIgnore // ✅ Hide verification expiration
    private LocalDateTime verificationCodeExpiresAt;
    @JsonIgnore // ✅ Hide enabled status
    private boolean enabled;

    public User() {}

    public User(Integer id, String username, String email, String password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }
}
