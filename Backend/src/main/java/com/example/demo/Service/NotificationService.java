package com.example.demo.Service;

import com.example.demo.gestionenicar.Notification;
import com.example.demo.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    
    public List<Notification> getNotificationsByEtudiant(Long idetudiant) {
        return notificationRepository.findByEtudiantIdetudiant(idetudiant);
    }
    
    public Notification createNotification(Notification notification) {
        notification.setDateEnvoi(new java.util.Date());
        notification.setStatut(Notification.Statut.ENVOYEE);
        return notificationRepository.save(notification);
    }
}