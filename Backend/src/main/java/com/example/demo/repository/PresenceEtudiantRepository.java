package com.example.demo.repository;

import com.example.demo.gestionenicar.PresenceEtudiant;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



@Repository
public interface PresenceEtudiantRepository extends JpaRepository<PresenceEtudiant, Long> {
	
	long countByEtudiantIdetudiantAndPresenceetudiantFalse(Long idetudiant);
	@Query("SELECT COUNT(p) FROM PresenceEtudiant p WHERE p.etudiant.idetudiant = :idEtudiant " +
		       "AND p.seance.enseignant.cours.idcours = :idCours AND p.presenceetudiant = false")
		long countAbsencesByEtudiantAndCours(@Param("idEtudiant") Long idEtudiant, 
		                                   @Param("idCours") Long idCours);

}