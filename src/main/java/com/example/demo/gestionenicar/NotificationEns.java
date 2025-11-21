package com.example.demo.gestionenicar;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter @Setter
@Table(name = "notification_ens")
public class NotificationEns {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idnotificatiionens")
    private Long idnotificatiionens;
    
    private String messageens;
    @Column(name = "date_envoiens", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateEnvoiens = new Date(); // Initialisation explicite
    
    @ManyToOne
    @JoinColumn(name = "idenseignant")
    private Enseignant enseignant;
    
    @ManyToOne
    @JoinColumn(name = "idseance")
    private Seance seance;
    
    @Enumerated(EnumType.STRING)
    private Statutens statutens = Statutens.ENVOYEE; // Valeur par défaut

    public enum Statutens {
        ENVOYEE, NON_ENVOYEE
    }

    @PrePersist
    protected void onCreate() {
        if (this.dateEnvoiens == null) {
            this.dateEnvoiens = new Date();
        }
    }
}