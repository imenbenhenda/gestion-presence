package com.example.demo.Controller;

import com.example.demo.Service.NotificationService;
import com.example.demo.gestionenicar.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotificationsByEtudiant(
            @RequestParam Long idetudiant) {
        List<Notification> notifications = notificationService.getNotificationsByEtudiant(idetudiant);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/envoyer")
    public ResponseEntity<Notification> envoyerNotification(@RequestBody Notification notification) {
        Notification savedNotification = notificationService.createNotification(notification);
        return ResponseEntity.ok(savedNotification);
    }
}