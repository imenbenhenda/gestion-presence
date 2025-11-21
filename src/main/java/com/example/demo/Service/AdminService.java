package com.example.demo.Service;

import com.example.demo.gestionenicar.Admin;

import com.example.demo.repository.AdminRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
    
    public Admin findByUsernameAndPassword(String username, String password) {
        return 	adminRepository.findByUsernameadminAndPasswordadmin(username, password);
    }
}
