package com.example.demo.gestionenicar;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;




@Entity
@Getter @Setter
public class Enseignant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idenseignant;
    private String usernameenseignant;
    private String passwordenseignant;
    private String nomenseignant;
    private String prenomenseignant;
    private String emailenseignant;
    
    @ManyToOne
    @JoinColumn(name = "idcours")
    private Cours cours;
}
