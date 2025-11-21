package com.example.demo.gestionenicar;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;


@Entity
@Getter @Setter
public class Seance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idseance;
    
    @Column(nullable = false)
    @Temporal(TemporalType.DATE)  
    private Date dateseance;
    
    private String heureDebutseance;
    private String heureFinseance;
    private String salleseance;
    
    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "idenseignant")
    private Enseignant enseignant;
    
    @ManyToOne(fetch = FetchType.EAGER)  
    @JoinColumn(name = "idclasse")
    private Classe classe;
    public Seance(Long id) {
        this.idseance = id;
    }
    public Seance() {}
}
