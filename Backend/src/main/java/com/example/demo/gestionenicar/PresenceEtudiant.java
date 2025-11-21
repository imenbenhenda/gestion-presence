package com.example.demo.gestionenicar;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;




@Entity
@Getter @Setter
public class PresenceEtudiant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idpresetudiant;
    private boolean presenceetudiant;
    
    @ManyToOne
    @JoinColumn(name = "idetudiant")
    private Etudiant etudiant;
    
    @ManyToOne
    @JoinColumn(name = "idseance")
    private Seance seance;
}
