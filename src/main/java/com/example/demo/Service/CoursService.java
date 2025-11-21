package com.example.demo.Service;

import com.example.demo.gestionenicar.Cours;
import com.example.demo.repository.CoursRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoursService {
    @Autowired
    private CoursRepository coursRepository;
    
    public List<Cours> getAllCours() {
        return coursRepository.findAll();
    }
}