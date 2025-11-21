package com.example.demo.gestionenicar;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;




@Entity
@Getter @Setter
public class Cours {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idcours;
    private String nomcours;
    private String description;
}