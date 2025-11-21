package com.example.demo.repository;

import com.example.demo.gestionenicar.Seance;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SeanceRepository extends JpaRepository<Seance, Long> {
	
	List<Seance> findByEnseignantIdenseignant(Long idenseignant);
	@Query("SELECT s FROM Seance s WHERE s.dateseance = :date " +
		       "AND s.heureFinseance <= :heureActuelle " +
		       "AND NOT EXISTS (SELECT pe FROM PresenceEnseignant pe WHERE pe.seance = s)")
		List<Seance> findSeancesTermineesSansAppel(
		    @Param("date") Date date,
		    @Param("heureActuelle") String heureActuelle);
	
	@Query("SELECT s FROM Seance s WHERE " +
		       "CONCAT(s.dateseance, ' ', s.heureFinseance) < :now AND " +
		       "NOT EXISTS (SELECT p FROM PresenceEnseignant p WHERE p.seance = s)")
		List<Seance> findByHeureFinBeforeAndPresenceNonEnregistree(@Param("now") LocalDateTime now);
	
	@Query("SELECT s FROM Seance s WHERE s.dateseance = :date ORDER BY s.heureDebutseance")
	List<Seance> findByDateseance(@Param("date") java.sql.Date date);

	@Query("SELECT s FROM Seance s WHERE s.dateseance <= :currentDate AND NOT EXISTS (SELECT p FROM PresenceEnseignant p WHERE p.seance = s AND p.presenceenseignant = true)")
	List<Seance> findSeancesTermineesSansPresence(LocalDate currentDate);

}
