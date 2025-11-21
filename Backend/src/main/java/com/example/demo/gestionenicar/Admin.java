package com.example.demo.gestionenicar;


import jakarta.persistence.*;

@Entity
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idadmin;
    private String usernameadmin;
    private String passwordadmin;
}
