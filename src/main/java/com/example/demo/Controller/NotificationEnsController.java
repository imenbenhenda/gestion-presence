package com.example.demo.Controller;

import com.example.demo.dto.NotificationDto;
import com.example.demo.gestionenicar.NotificationEns;
import com.example.demo.repository.NotificationEnsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications-enseignants")
public class NotificationEnsController {

    @Autowired
    private NotificationEnsRepository notificationEnsRepository;
    
    

    @GetMapping("/enseignant/{idEnseignant}")
    public List<NotificationDto> getByEnseignant(@PathVariable Long idEnseignant) {
        return notificationEnsRepository.findByEnseignant_IdenseignantOrderByDateEnvoiensDesc(idEnseignant)
            .stream()
            .map(notification -> {
                NotificationDto dto = new NotificationDto();
                dto.setIdnot(notification.getIdnotificatiionens());
                dto.setMessage(notification.getMessageens());
                dto.setDateEnvoi(notification.getDateEnvoiens());
                dto.setStatut(notification.getStatutens());
                
                if (notification.getSeance() != null) {
                    dto.setDateSeance(notification.getSeance().getDateseance());
                    dto.setHeureDebut(notification.getSeance().getHeureDebutseance());
                    dto.setHeureFin(notification.getSeance().getHeureFinseance());
                    
                    if (notification.getSeance().getEnseignant() != null && 
                        notification.getSeance().getEnseignant().getCours() != null) {
                        dto.setNomCours(notification.getSeance().getEnseignant().getCours().getNomcours());
                    }
                }
                
                return dto;
            })
            .collect(Collectors.toList());
    }
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleNotificationStatus(@PathVariable Long id) {
        return notificationEnsRepository.findById(id)
            .map(notification -> {
                notification.setStatutens(
                    notification.getStatutens() == NotificationEns.Statutens.ENVOYEE 
                        ? NotificationEns.Statutens.NON_ENVOYEE 
                        : NotificationEns.Statutens.ENVOYEE
                );
                notificationEnsRepository.save(notification);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        notificationEnsRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
}