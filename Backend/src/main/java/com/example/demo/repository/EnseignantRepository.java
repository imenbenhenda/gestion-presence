package com.example.demo.repository;

import com.example.demo.gestionenicar.Enseignant;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnseignantRepository extends JpaRepository<Enseignant, Long> {
	 
	  Enseignant findByUsernameenseignantAndPasswordenseignant(String usernameenseignant, String passwordenseignant);

}
