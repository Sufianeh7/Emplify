package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepo extends JpaRepository<Usuario, Integer> {
    // Añadimos esto para que Spring Security encuentre al usuario por email
    Optional<Usuario> findByEmail(String email);
}