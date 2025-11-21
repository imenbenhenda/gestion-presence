package com.example.demo.Controller;

import com.example.demo.Service.PresenceEnseignantService;
import com.example.demo.gestionenicar.PresenceEnseignant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}, 
allowedHeaders = "*",
allowCredentials = "true")
@RestController
@RequestMapping("/presences-enseignants")
public class PresenceEnseignantController {
    
    @Autowired
    private PresenceEnseignantService presenceEnseignantService;
    @GetMapping
    public List<PresenceEnseignant> getAllPresencesEnseignants() {
        return presenceEnseignantService.getAllPresencesEnseignants();
    }

    @PostMapping("/enregistrer")
    public ResponseEntity<?> enregistrerPresence(
            @RequestBody Map<String, Object> requestBody) {
        try {
            Long idSeance = Long.parseLong(requestBody.get("idSeance").toString());
            Long idEnseignant = Long.parseLong(requestBody.get("idEnseignant").toString());
            
            boolean present = presenceEnseignantService.verifierPresenceEnseignant(idSeance, idEnseignant);
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "present", present,
                "message", present ? "Présence enregistrée avec succès" : "Absence enregistrée"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
}