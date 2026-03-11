package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepo extends JpaRepository<Usuario, Integer> {

    // Busca al usuario para el inicio de sesión
    Optional<Usuario> findByEmail(String email);

    // Comprueba de forma rápida si un email ya está registrado
    boolean existsByEmail(String email);
}