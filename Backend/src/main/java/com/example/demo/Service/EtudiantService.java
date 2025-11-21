package com.example.demo.Service;

import com.example.demo.gestionenicar.Etudiant;
import com.example.demo.repository.EtudiantRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EtudiantService {
    @Autowired
    private EtudiantRepository etudiantRepository;
    
    public List<Etudiant> getAllEtudiants() {
        return etudiantRepository.findAll();
    }
    public List<Etudiant> getEtudiantsByClasse(Long idClasse) {
        return etudiantRepository.findByClasseIdclasse(idClasse);
    }
   
    public Etudiant findByUsernameAndPassword(String username, String password) {
        return etudiantRepository.findByUsernameetudiantAndPasswordetudiant(username, password);
    }
}
