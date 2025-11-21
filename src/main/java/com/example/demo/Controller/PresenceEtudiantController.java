package com.example.demo.Controller;

import com.example.demo.gestionenicar.PresenceEtudiant;
import com.example.demo.repository.EnseignantRepository;
import com.example.demo.repository.SeanceRepository;
import com.example.demo.gestionenicar.Seance;
import com.example.demo.Service.PresenceEnseignantService;
import com.example.demo.Service.PresenceEtudiantService;
import com.example.demo.gestionenicar.Enseignant;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/presences-etudiants")
@CrossOrigin(origins = {
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8081",
    "http://localhost"
})
public class PresenceEtudiantController {

    @Autowired
    private PresenceEtudiantService presenceEtudiantService;

    @Autowired
    private PresenceEnseignantService presenceEnseignantService;

    @Autowired
    private SeanceRepository seanceRepository;

    @Autowired
    private EnseignantRepository enseignantRepository;

    @GetMapping
    public List<PresenceEtudiant> getAllPresencesEtudiants() {
        return presenceEtudiantService.getAllPresencesEtudiants();
    }

    @PostMapping("/enregistrer")
    @Transactional
    public ResponseEntity<Map<String, Object>> enregistrerPresences(@RequestBody Map<String, Object> payload) {
        log.info("=== DÉBUT ENREGISTREMENT APPEL ===");
        log.info("Payload reçu: {}", payload);

        try {
            if (payload == null || payload.isEmpty()) {
                throw new IllegalArgumentException("Payload vide ou null");
            }

            Long idSeance = convertToLong(payload.get("idSeance"));
            Long idEnseignant = convertToLong(payload.get("idEnseignant"));

            Seance seance = seanceRepository.findById(idSeance)
                .orElseThrow(() -> new RuntimeException("Séance introuvable"));

            Enseignant enseignant = enseignantRepository.findById(idEnseignant)
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> presences = (List<Map<String, Object>>) payload.get("presences");
            if (presences == null || presences.isEmpty()) {
                throw new IllegalArgumentException("Liste des présences vide");
            }

            boolean enseignantPresent = presenceEnseignantService.verifierPresenceEnseignant(idSeance, idEnseignant);
            if (!enseignantPresent) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Enseignant absent (délai dépassé)"
                ));
            }

            presenceEtudiantService.enregistrerPresences(idSeance, presences);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", presences.size() + " présences enregistrées avec succès"
            ));

        } catch (Exception e) {
            log.error("Erreur d'enregistrement", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Erreur technique",
                "error", e.getMessage(),
                "stacktrace", Arrays.toString(e.getStackTrace())
            ));
        }
    }

    private Long convertToLong(Object obj) {
        try {
            if (obj instanceof Number) {
                return ((Number) obj).longValue();
            }
            return Long.parseLong(obj.toString());
        } catch (Exception e) {
            throw new IllegalArgumentException("ID invalide: " + obj);
        }
    }
}