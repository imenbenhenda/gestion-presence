package com.example.demo.Controller;

import com.example.demo.Service.ClasseService;
import com.example.demo.gestionenicar.Classe;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/classes")
public class ClasseController {
    @Autowired
    private ClasseService classeService;
    
    @GetMapping
    public List<Classe> getAllClasses() {
        return classeService.getAllClasses();
    }
}
