package com.emplify.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {

		SpringApplication.run(BackendApplication.class, args);

		/*
		// --- Ver el HASH generado ---
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		String miHash = encoder.encode("password");
		System.out.println("=========================================");
		System.out.println("Hash exacto para 'password' es:" + miHash);
		System.out.println("=========================================");
		*/
	}

}
