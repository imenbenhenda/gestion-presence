package com.example.demo.Service;

import com.example.demo.gestionenicar.Seance;
import com.example.demo.repository.SeanceRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
public class SeanceService {

    @Autowired
    private SeanceRepository seanceRepository;

    public List<Seance> getAllSeances() {
        return seanceRepository.findAll();
    }

    public List<Seance> getSeancesByEnseignant(Long idEnseignant) {
        return seanceRepository.findByEnseignantIdenseignant(idEnseignant);
    }

    @Transactional
    @Scheduled(cron = "0 44 9 * * MON")  
    public void updateSeanceDatesWeekly() {
        System.out.println("--- DÉBUT MISE À JOUR DES DATES --- " + new Date());
        
        List<Seance> seances = seanceRepository.findAll();
        System.out.println("Nombre de séances à mettre à jour: " + seances.size());

        for (Seance seance : seances) {
            Date ancienneDate = seance.getDateseance();
           
            Calendar cal = Calendar.getInstance();
            cal.setTime(ancienneDate);
            cal.add(Calendar.DAY_OF_MONTH, 7);
            Date nouvelleDate = cal.getTime();
            
            seance.setDateseance(nouvelleDate);
            System.out.println("Mise à jour - ID: " + seance.getIdseance() 
                + " | Ancienne date: " + ancienneDate 
                + " | Nouvelle date: " + nouvelleDate);
        }

        seanceRepository.saveAll(seances);
        System.out.println("--- MISE À JOUR TERMINÉE ---");
    }

    
}