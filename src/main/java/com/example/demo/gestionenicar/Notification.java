package com.example.demo.gestionenicar;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;


@Entity
@Getter @Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idnotificatiion;
    private String message;
    private Date dateEnvoi;
    
    @ManyToOne
    @JoinColumn(name = "idetudiant")
    private Etudiant etudiant;
    
    @ManyToOne
    @JoinColumn(name = "idseance")
    private Seance seance;
    @Enumerated(EnumType.STRING)
    private Statut statut;

    public enum Statut {
        ENVOYEE, NON_ENVOYEE
    }
}