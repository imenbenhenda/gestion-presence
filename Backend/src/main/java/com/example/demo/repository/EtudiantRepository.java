package com.example.demo.repository;

import com.example.demo.gestionenicar.Etudiant;
import com.example.demo.gestionenicar.Classe;
import com.example.demo.gestionenicar.Enseignant;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
	
	List<Etudiant> findByClasseIdclasse(Long idclasse);
	Etudiant findByUsernameetudiantAndPasswordetudiant(String usernameetudiant, String passwordetudiant);
}
