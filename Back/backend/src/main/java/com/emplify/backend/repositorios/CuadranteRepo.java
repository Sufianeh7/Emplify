package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Cuadrante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CuadranteRepo extends JpaRepository<Cuadrante, Integer> {

    // Busca todos los turnos de un empleado específico
    List<Cuadrante> findByEmpleado_IdEmpleado(Integer idEmpleado);

    // NUEVO: Busca si un empleado ya tiene un turno asignado en una fecha concreta
    Optional<Cuadrante> findByEmpleado_IdEmpleadoAndFecha(Integer idEmpleado, LocalDate fecha);
}