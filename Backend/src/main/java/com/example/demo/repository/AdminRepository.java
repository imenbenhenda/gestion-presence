package com.example.demo.repository;

import com.example.demo.gestionenicar.Admin;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
	Admin findByUsernameadminAndPasswordadmin(String usernameadmin, String passwordadmin);
}
