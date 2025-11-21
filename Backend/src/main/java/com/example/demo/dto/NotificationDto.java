package com.example.demo.dto;

import com.example.demo.gestionenicar.NotificationEns;
import java.util.Date;

public class NotificationDto {
    private Long idnot;
    private String message;
    private Date dateEnvoi;
    private NotificationEns.Statutens statut;
    private Date dateSeance;
    private String heureDebut;
    private String heureFin;
    private String nomCours;

    // Getters et Setters
    public Long getIdnot() {
        return idnot;
    }

    public void setIdnot(Long idnot) {
        this.idnot = idnot;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Date getDateEnvoi() {
        return dateEnvoi;
    }

    public void setDateEnvoi(Date dateEnvoi) {
        this.dateEnvoi = dateEnvoi;
    }

    public NotificationEns.Statutens getStatut() {
        return statut;
    }

    public void setStatut(NotificationEns.Statutens statut) {
        this.statut = statut;
    }

    public Date getDateSeance() {
        return dateSeance;
    }

    public void setDateSeance(Date dateSeance) {
        this.dateSeance = dateSeance;
    }

    public String getHeureDebut() {
        return heureDebut;
    }

    public void setHeureDebut(String heureDebut) {
        this.heureDebut = heureDebut;
    }

    public String getHeureFin() {
        return heureFin;
    }

    public void setHeureFin(String heureFin) {
        this.heureFin = heureFin;
    }

    public String getNomCours() {
        return nomCours;
    }

    public void setNomCours(String nomCours) {
        this.nomCours = nomCours;
    }
}