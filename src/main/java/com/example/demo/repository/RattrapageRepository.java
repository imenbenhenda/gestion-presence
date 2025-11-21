package com.example.demo.repository;

import com.example.demo.gestionenicar.Rattrapage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RattrapageRepository extends JpaRepository<Rattrapage, Long> {
    
    @Query("SELECT r FROM Rattrapage r " +
           "LEFT JOIN FETCH r.enseignant e " +
           "LEFT JOIN FETCH e.cours " +
           "LEFT JOIN FETCH r.classe " +
           "WHERE r.etatValidation = 'En attente' OR r.etatValidation IS NULL")
    List<Rattrapage> findAllWithDetails();
    
    @Query("SELECT r FROM Rattrapage r WHERE r.enseignant.idenseignant = :idEnseignant")
    List<Rattrapage> findByEnseignantIdenseignant(@Param("idEnseignant") Long idEnseignant);
}