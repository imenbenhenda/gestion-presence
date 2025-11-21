package com.example.demo.repository;

import com.example.demo.gestionenicar.Enseignant;
import com.example.demo.gestionenicar.PresenceEnseignant;
import com.example.demo.gestionenicar.Seance;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PresenceEnseignantRepository extends JpaRepository<PresenceEnseignant, Long> {
	@Query("SELECT pe FROM PresenceEnseignant pe WHERE pe.seance.idseance = :idSeance AND pe.enseignant.idenseignant = :idEnseignant")
	PresenceEnseignant findBySeanceAndEnseignant(@Param("idSeance") Long idSeance, @Param("idEnseignant") Long idEnseignant);
	boolean existsBySeance(Seance seance);
	
	@Query("SELECT COUNT(p) > 0 FROM PresenceEnseignant p WHERE p.seance = :seance AND p.enseignant = :enseignant AND p.presenceenseignant = true")
	boolean existsBySeanceAndEnseignantAndPresenceenseignantTrue(
	    @Param("seance") Seance seance,
	    @Param("enseignant") Enseignant enseignant
	);
	;
	 boolean existsBySeanceAndEnseignant(Seance seance, Enseignant enseignant);
	    
	    @Query("SELECT COUNT(p) > 0 FROM PresenceEnseignant p WHERE p.seance = :seance AND p.enseignant = :enseignant AND p.presenceenseignant = true")
	    boolean existsPresencePositive(@Param("seance") Seance seance, @Param("enseignant") Enseignant enseignant);
	
}
