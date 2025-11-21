package com.example.demo.Controller;

import com.example.demo.Service.RattrapageService;
import com.example.demo.gestionenicar.Rattrapage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rattrapages")
public class RattrapageController {
    
    @Autowired
    private RattrapageService rattrapageService;
    
    @GetMapping
    public ResponseEntity<List<Rattrapage>> getAllRattrapages() {
        List<Rattrapage> rattrapages = rattrapageService.getAllRattrapages();
        return ResponseEntity.ok(rattrapages);
    }

    @GetMapping("/enseignant/{idEnseignant}")
    public ResponseEntity<List<Rattrapage>> getRattrapagesByEnseignant(@PathVariable Long idEnseignant) {
        List<Rattrapage> rattrapages = rattrapageService.getByEnseignant(idEnseignant);
        return ResponseEntity.ok(rattrapages);
    }

    @PatchMapping("/{id}/{action}")
    public ResponseEntity<?> updateRattrapageStatus(
            @PathVariable Long id,
            @PathVariable String action) {
        
        try {
            Rattrapage updated = rattrapageService.updateStatus(id, action);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<Rattrapage> createRattrapage(@RequestBody Rattrapage rattrapage) {
        Rattrapage savedRattrapage = rattrapageService.createRattrapage(rattrapage);
        return ResponseEntity.ok(savedRattrapage);
    }
}