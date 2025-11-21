package com.example.demo.Controller;

import com.example.demo.Service.CoursService;
import com.example.demo.gestionenicar.Cours;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cours")
public class CoursController {
    @Autowired
    private CoursService coursService;
    
    @GetMapping
    public List<Cours> getAllCours() {
        return coursService.getAllCours();
    }
}
