package com.example.demo.gestionenicar;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter @Setter
@NoArgsConstructor
public class PresenceEnseignant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idpresenceenseignant;
    private boolean presenceenseignant;
    
    @Column(nullable = false)
    private boolean automatique = false; 
    
    @ManyToOne
    @JoinColumn(name = "idenseignant")
    private Enseignant enseignant;
    
    @ManyToOne
    @JoinColumn(name = "idseance")
    private Seance seance;

    @Column(nullable = false)
    private Date dateEnregistrement = new Date(); 

    public PresenceEnseignant(Enseignant enseignant, Seance seance, boolean presence) {
        this.enseignant = enseignant;
        this.seance = seance;
        this.presenceenseignant = presence;
    }
    
    // Constructeur spécifique pour les absences automatiques
    public PresenceEnseignant(Enseignant enseignant, Seance seance, boolean presence, boolean automatique) {
        this.enseignant = enseignant;
        this.seance = seance;
        this.presenceenseignant = presence;
        this.automatique = automatique;
    }
}