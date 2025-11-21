package com.example.demo.Service;

import com.example.demo.gestionenicar.Classe;
import com.example.demo.repository.ClasseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClasseService {
    @Autowired
    private ClasseRepository classeRepository;
    
    public List<Classe> getAllClasses() {
        return classeRepository.findAll();
    }
}