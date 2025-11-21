package com.example.demo.gestionenicar;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;




@Entity
@Getter @Setter
public class Etudiant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idetudiant;
    private String usernameetudiant;
    private String passwordetudiant;
    private String nometudiant;
    private String prenometudiant;
    private String emailetudiant;
    
    @ManyToOne
    @JoinColumn(name = "idclasse")
    private Classe classe;
}