package com.example.demo.gestionenicar;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;


@Entity
@Getter @Setter
public class Rattrapage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idrattrapage;
    private Date dateRattrapage;
    private String heureDebutrattra;
    private String heureFinrattra;
    private String etatValidation;
    
    @ManyToOne
    @JoinColumn(name = "idenseignant")
    private Enseignant enseignant;
    
    @ManyToOne
    @JoinColumn(name = "idclasse")
    private Classe classe;
}
