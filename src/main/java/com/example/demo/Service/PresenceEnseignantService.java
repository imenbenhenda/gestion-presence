package com.example.demo.Service;

import com.example.demo.gestionenicar.NotificationEns;
import com.example.demo.gestionenicar.PresenceEnseignant;
import com.example.demo.gestionenicar.Seance;
import com.example.demo.repository.EnseignantRepository;
import com.example.demo.repository.NotificationEnsRepository;
import com.example.demo.repository.PresenceEnseignantRepository;
import com.example.demo.repository.RattrapageRepository;
import com.example.demo.repository.SeanceRepository;

import lombok.extern.slf4j.Slf4j;

import com.example.demo.gestionenicar.Enseignant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date; 
import java.util.List;
import java.time.LocalDate;
import java.time.ZoneId;
import java.text.SimpleDateFormat;
import java.util.Locale;
@Service
@Slf4j 
public class PresenceEnseignantService {
    @Autowired
    private PresenceEnseignantRepository presenceenseignantRepository;
    @Autowired
    private EnseignantRepository enseignantRepository;
    @Autowired
    private SeanceRepository seanceRepository;
    @Autowired
    private NotificationEnsRepository notificationEnsRepository;
    @Autowired
    private RattrapageRepository rattrapageRepository;
    public List<PresenceEnseignant> getAllPresencesEnseignants() {
        return presenceenseignantRepository.findAll();
    }
    
    @Transactional
    public boolean verifierPresenceEnseignant(Long idSeance, Long idEnseignant) {
        Seance seance = seanceRepository.findById(idSeance)
            .orElseThrow(() -> new RuntimeException("Séance introuvable"));
        Enseignant enseignant = enseignantRepository.findById(idEnseignant)
            .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

        LocalTime heureDebut = convertToLocalTime(seance.getHeureDebutseance());
        LocalTime heureFin = convertToLocalTime(seance.getHeureFinseance());
        
        LocalDate dateSeance = convertToLocalDate(seance.getDateseance());
        
        LocalDateTime debutSeance = LocalDateTime.of(dateSeance, heureDebut);
        LocalDateTime finSeance = LocalDateTime.of(dateSeance, heureFin);

        boolean seanceTerminee = LocalDateTime.now().isAfter(finSeance);
        boolean appelFaitPendantSeance = presenceenseignantRepository
            .existsBySeanceAndEnseignantAndPresenceenseignantTrue(seance, enseignant);

        if (!seanceTerminee) {
            if (!appelFaitPendantSeance) {
                PresenceEnseignant presence = new PresenceEnseignant();
                presence.setEnseignant(enseignant);
                presence.setSeance(seance);
                presence.setPresenceenseignant(true);
                presenceenseignantRepository.save(presence);
            }
            return true;
        }

        if (!appelFaitPendantSeance) {
            PresenceEnseignant presence = new PresenceEnseignant();
            presence.setEnseignant(enseignant);
            presence.setSeance(seance);
            presence.setPresenceenseignant(false);
            presenceenseignantRepository.save(presence);
            envoyerNotificationAbsence(seance, enseignant);
            return false;
        }

        return true;
    }

    private LocalDate convertToLocalDate(Date date) {
       
        if (date instanceof java.sql.Date) {
            return ((java.sql.Date) date).toLocalDate();
        }
      
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }
    

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void envoyerNotificationAbsence(Seance seance, Enseignant enseignant) {
        try {
            NotificationEns notification = new NotificationEns();
            
            String message = String.format(
                "Absence enregistrée pour le cours %s du %s de %s à %s",
                (seance.getEnseignant() != null && seance.getEnseignant().getCours() != null 
                 ? seance.getEnseignant().getCours().getNomcours() 
                 : "cours inconnu"),
                new SimpleDateFormat("EEEE dd MMMM yyyy", Locale.FRENCH).format(seance.getDateseance()),
                seance.getHeureDebutseance(),
                seance.getHeureFinseance()
            );
            
            notification.setMessageens(message);
            notification.setDateEnvoiens(new Date());
            notification.setEnseignant(enseignant);
            notification.setSeance(seance);
            notification.setStatutens(NotificationEns.Statutens.ENVOYEE);
            
            notificationEnsRepository.saveAndFlush(notification);

            
        } catch (Exception e) {
            log.error("Échec d'envoi de notification pour la séance {}", seance.getIdseance(), e);
            throw new RuntimeException("Échec d'envoi de notification", e);
        }
    }
 
    private LocalTime convertToLocalTime(String heureStr) {
        try {
            
            String heureNettoyee = heureStr.replace(" ", "").replace("h", ":");
            String[] parties = heureNettoyee.split(":");
            
            int heures = Integer.parseInt(parties[0]);
            int minutes = parties.length > 1 ? Integer.parseInt(parties[1]) : 0;
            
            return LocalTime.of(heures, minutes);
        } catch (Exception e) {
            throw new IllegalArgumentException("Format d'heure invalide: " + heureStr + 
                ". Le format attendu est 'HHhMM' ou 'HH:MM' (ex: 08h30 ou 14:45)");
        }
    }
    @Scheduled(cron = "0 * * * * *")  
    @Transactional
    public void verifierSeancesTerminees() {
        LocalDateTime now = LocalDateTime.now();
       
        List<Seance> seances = seanceRepository.findSeancesTermineesSansPresence(now.toLocalDate());

        for (Seance seance : seances) {
            LocalDate dateSeance = convertToLocalDate(seance.getDateseance());
            LocalTime heureFin = convertToLocalTime(seance.getHeureFinseance());
            LocalDateTime finSeance = LocalDateTime.of(dateSeance, heureFin);

           
            if (now.isAfter(finSeance)) {
                Enseignant enseignant = seance.getEnseignant();
             
                PresenceEnseignant presence = new PresenceEnseignant();
                presence.setEnseignant(enseignant);
                presence.setSeance(seance);
                presence.setPresenceenseignant(false);
                presence.setAutomatique(true); 
               
                presence.setDateEnregistrement(Date.from(now.atZone(ZoneId.systemDefault()).toInstant()));
                presenceenseignantRepository.save(presence);

                envoyerNotificationAbsence(seance, enseignant);
            }
        }
    }
}