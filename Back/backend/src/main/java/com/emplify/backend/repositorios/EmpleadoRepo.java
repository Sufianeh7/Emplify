package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmpleadoRepo extends JpaRepository<Empleado, Integer> {
    // Busca dentro de la relación Usuario el campo email y nombre
    Optional<Empleado> findByUsuarioEmail(String email);

    Optional<Empleado> findByUsuarioNombre(String nombre);
}