package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpleadoRepo extends JpaRepository<Empleado, Integer>{
    // Hereda métodos como findAll() y save() de JpaRepository
}
