package com.example.demo.Service;

import com.example.demo.gestionenicar.*;
import com.example.demo.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class RattrapageService {

    private static final Logger logger = LoggerFactory.getLogger(RattrapageService.class);

    @Autowired
    private RattrapageRepository rattrapageRepository;

    @Autowired
    private NotificationEnsService notificationEnsService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EtudiantRepository etudiantRepository;

    public List<Rattrapage> getAllRattrapages() {
        return rattrapageRepository.findAllWithDetails();
    }

    public List<Rattrapage> getByEnseignant(Long idEnseignant) {
        return rattrapageRepository.findByEnseignantIdenseignant(idEnseignant);
    }

    @Transactional
    public Rattrapage updateStatus(Long id, String action) {
        logger.info("Updating status for rattrapage ID: {} with action: {}", id, action);

        Rattrapage rattrapage = rattrapageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rattrapage non trouvé"));
        
        String newStatus = action.equalsIgnoreCase("accept") ? "Accepté" : "Refusé";
        rattrapage.setEtatValidation(newStatus);
        Rattrapage updatedRattrapage = rattrapageRepository.save(rattrapage);
        logger.info("Rattrapage ID: {} updated with status: {}", id, newStatus);

        if (newStatus.equals("Accepté")) {
            sendNotificationsForAcceptedRattrapage(updatedRattrapage);
        }

        return updatedRattrapage;
    }

    private void sendNotificationsForAcceptedRattrapage(Rattrapage rattrapage) {
        // Notify the teacher
        if (rattrapage.getEnseignant() == null) {
            logger.warn("No enseignant associated with rattrapage ID: {}", rattrapage.getIdrattrapage());
            return;
        }

        NotificationEns teacherNotification = new NotificationEns();
        teacherNotification.setEnseignant(rattrapage.getEnseignant());
        
        String coursNom = "Non spécifié";
        if (rattrapage.getEnseignant().getCours() != null) {
            coursNom = rattrapage.getEnseignant().getCours().getNomcours();
        }

        String dateRattrapage = "Non défini";
        if (rattrapage.getDateRattrapage() != null) {
            dateRattrapage = rattrapage.getDateRattrapage().toString();
        }

        String heureDebut = rattrapage.getHeureDebutrattra() != null ? rattrapage.getHeureDebutrattra() : "Non défini";
        String heureFin = rattrapage.getHeureFinrattra() != null ? rattrapage.getHeureFinrattra() : "Non défini";

        teacherNotification.setMessageens(String.format(
            "Votre demande de rattrapage pour le cours %s le %s de %s à %s a été acceptée.",
            coursNom,
            dateRattrapage,
            heureDebut,
            heureFin
        ));
        teacherNotification.setDateEnvoiens(new Date());
        teacherNotification.setStatutens(NotificationEns.Statutens.ENVOYEE);
      
        try {
            notificationEnsService.saveNotification(teacherNotification);
            logger.info("Teacher notification saved for enseignant ID: {}", rattrapage.getEnseignant().getIdenseignant());
        } catch (Exception e) {
            logger.error("Failed to save teacher notification for rattrapage ID: {}", rattrapage.getIdrattrapage(), e);
        }

        if (rattrapage.getClasse() == null) {
            logger.warn("No classe associated with rattrapage ID: {}", rattrapage.getIdrattrapage());
            return;
        }

        List<Etudiant> students = etudiantRepository.findByClasseIdclasse(rattrapage.getClasse().getIdclasse());
        if (students.isEmpty()) {
            logger.warn("No students found for classe ID: {} in rattrapage ID: {}", 
                        rattrapage.getClasse().getIdclasse(), rattrapage.getIdrattrapage());
        }

        for (Etudiant student : students) {
            Notification studentNotification = new Notification();
            studentNotification.setEtudiant(student);
            studentNotification.setMessage(String.format(
                "Une séance de rattrapage pour le cours %s est prévue le %s de %s à %s.",
                coursNom,
                dateRattrapage,
                heureDebut,
                heureFin
            ));
            studentNotification.setDateEnvoi(new Date());
            studentNotification.setStatut(Notification.Statut.ENVOYEE);
            
            try {
                notificationService.createNotification(studentNotification);
                logger.info("Student notification saved for etudiant ID: {}", student.getIdetudiant());
            } catch (Exception e) {
                logger.error("Failed to save student notification for etudiant ID: {} in rattrapage ID: {}", 
                             student.getIdetudiant(), rattrapage.getIdrattrapage(), e);
            }
        }
    }

    public Rattrapage createRattrapage(Rattrapage rattrapage) {
        if (rattrapage.getDateRattrapage() == null) {
            throw new IllegalArgumentException("La date de rattrapage ne peut pas être nulle.");
        }
        return rattrapageRepository.save(rattrapage);
    }
}