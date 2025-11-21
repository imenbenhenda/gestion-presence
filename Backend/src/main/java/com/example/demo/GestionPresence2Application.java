package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
	public class GestionPresence2Application {
	    public static void main(String[] args) {
	        SpringApplication.run(GestionPresence2Application.class, args);
	    }
	}

