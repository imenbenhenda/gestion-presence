package com.example.demo.Service;

import com.example.demo.gestionenicar.NotificationEns;
import com.example.demo.repository.NotificationEnsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationEnsService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationEnsService.class);

    @Autowired
    private NotificationEnsRepository notificationEnsRepository;

    public List<NotificationEns> getAllNotification() {
        return notificationEnsRepository.findAll();
    }

    public NotificationEns saveNotification(NotificationEns notification) {
        logger.info("Saving notification for enseignant ID: {}", 
                    notification.getEnseignant() != null ? notification.getEnseignant().getIdenseignant() : "null");
        return notificationEnsRepository.save(notification);
    }
}