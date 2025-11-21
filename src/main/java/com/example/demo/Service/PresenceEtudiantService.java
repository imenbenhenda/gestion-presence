package com.example.demo.Service;

import com.example.demo.gestionenicar.PresenceEtudiant;
import com.example.demo.gestionenicar.Seance;
import com.example.demo.repository.EtudiantRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.PresenceEtudiantRepository;
import com.example.demo.repository.SeanceRepository;
import com.example.demo.gestionenicar.Etudiant;
import com.example.demo.gestionenicar.Notification;

import com.example.demo.gestionenicar.Cours;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class PresenceEtudiantService {
	 private static final Logger logger = LoggerFactory.getLogger(PresenceEtudiantService.class);
    @Autowired
    private PresenceEtudiantRepository presenceetudiantRepository;
    @Autowired
    private SeanceRepository seanceRepository;
    @Autowired
    private EtudiantRepository etudiantRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    public List<PresenceEtudiant> getAllPresencesEtudiants() {
        return presenceetudiantRepository.findAll();
    }
    private Long convertToLong(Object obj) {
        if (obj == null) {
            throw new IllegalArgumentException("La valeur ne peut pas être null");
        }
        try {
            if (obj instanceof Number) {
                return ((Number) obj).longValue();
            }
            return Long.parseLong(obj.toString());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Conversion impossible en Long: " + obj);
        }
    }
   
   
    @Transactional
    public void enregistrerPresences(Long idSeance, List<Map<String, Object>> presences) {
        log.info("Début enregistrement des présences pour la séance {}", idSeance);
        
        Seance seance = seanceRepository.findById(idSeance)
            .orElseThrow(() -> {
                log.error("Séance {} introuvable", idSeance);
                return new RuntimeException("Séance introuvable");
            });

        for (Map<String, Object> presenceMap : presences) {
            try {
                Long idEtudiant = convertToLong(presenceMap.get("idEtudiant"));
                boolean estPresent = Boolean.parseBoolean(presenceMap.get("present").toString());
                
                Etudiant etudiant = etudiantRepository.findById(idEtudiant)
                    .orElseThrow(() -> {
                        log.error("Étudiant {} introuvable", idEtudiant);
                        return new RuntimeException("Étudiant introuvable: " + idEtudiant);
                    });

                PresenceEtudiant presence = new PresenceEtudiant();
                presence.setEtudiant(etudiant);
                presence.setSeance(seance);
                presence.setPresenceetudiant(estPresent);
                
                log.debug("Enregistrement présence: Étudiant {} - Présent: {}", idEtudiant, estPresent);
                presenceetudiantRepository.save(presence);

                if (!estPresent) {
                    traiterAbsenceEtudiant(etudiant, seance);
                }
                
            } catch (Exception e) {
                log.error("Erreur traitement présence: {}", presenceMap, e);
                throw e; 
            }
        }
        log.info("{} présences enregistrées avec succès", presences.size());
    }
    

    private void traiterAbsenceEtudiant(Etudiant etudiant, Seance seance) {
        
        long nbAbsences = presenceetudiantRepository.countAbsencesByEtudiantAndCours(
            etudiant.getIdetudiant(), 
            seance.getEnseignant().getCours().getIdcours()
        );
        
        
        envoyerNotification(
            etudiant, 
            seance,
            "Absence enregistrée en " + seance.getEnseignant().getCours().getNomcours() + 
            ". Nombre d'absences: " + nbAbsences + "/3"
        );
        
        
        if (nbAbsences >= 3) {
            exclureEtudiantDuCours(etudiant, seance.getEnseignant().getCours());
        }
    }

    private void exclureEtudiantDuCours(Etudiant etudiant, Cours cours) {
        
      
        envoyerNotification(
            etudiant,
            null, 
            "Vous avez été exclu du cours " + cours.getNomcours() + 
            " pour avoir dépassé 3 absences. Contactez l'administration."
        );
        
        logger.info("Étudiant {} exclu du cours {}", etudiant.getIdetudiant(), cours.getIdcours());
    }

    private void envoyerNotification(Etudiant etudiant, Seance seance, String message) {
        Notification notification = new Notification();
        notification.setEtudiant(etudiant);
        notification.setSeance(seance);
        notification.setMessage(message);
        notification.setDateEnvoi(new Date());
        notification.setStatut(Notification.Statut.ENVOYEE);
        notificationRepository.save(notification);
        
        
    }

}