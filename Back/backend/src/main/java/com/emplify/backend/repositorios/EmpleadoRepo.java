package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmpleadoRepo extends JpaRepository<Empleado, Integer> {
    // Esta "magia" de Spring busca dentro de la relación Usuario el campo email
    Optional<Empleado> findByUsuarioEmail(String email);
}