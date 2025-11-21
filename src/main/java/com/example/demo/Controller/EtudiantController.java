package com.example.demo.Controller;

import com.example.demo.Service.EtudiantService;
import com.example.demo.gestionenicar.Etudiant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/etudiants")
public class EtudiantController {
    @Autowired
    private EtudiantService etudiantService;
    
    @GetMapping
    public List<Etudiant> getAllEtudiants() {
        return etudiantService.getAllEtudiants();
    }
    @GetMapping("/classe/{idClasse}")
    public List<Etudiant> getEtudiantsByClasse(
        @PathVariable("idClasse") Long idClasse) {  
        return etudiantService.getEtudiantsByClasse(idClasse);
    }
    @PostMapping("/login")
    public ResponseEntity<?> loginEtudiant(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("usernameetudiant");
        String password = credentials.get("passwordetudiant");
        
        Etudiant etudiant = etudiantService.findByUsernameAndPassword(username, password);
        
        if (etudiant != null) {
            return ResponseEntity.ok(etudiant);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Identifiants invalides");
        }
    }
}
