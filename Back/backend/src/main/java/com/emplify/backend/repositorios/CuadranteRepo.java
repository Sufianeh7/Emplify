package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Cuadrante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CuadranteRepo extends JpaRepository<Cuadrante, Integer> {

    // Devuelve todos los turnos de un empleado
    List<Cuadrante> findByEmpleado_IdEmpleado(Integer idEmpleado);

    // Busca si existe un turno específico en un día concreto para un empleado
    Optional<Cuadrante> findByEmpleado_IdEmpleadoAndFecha(Integer idEmpleado, LocalDate fecha);

    // Devuelve los turnos de un empleado en un rango de fechas
    List<Cuadrante> findByEmpleado_IdEmpleadoAndFechaBetween(Integer idEmpleado, LocalDate inicio, LocalDate fin);

    // NUEVO Y OPTIMIZADO: Busca el primer turno de un empleado a partir de una fecha concreta, ordenado cronológicamente.
    // Esto evita traer miles de registros a la memoria de Java.
    Optional<Cuadrante> findFirstByEmpleado_IdEmpleadoAndFechaGreaterThanEqualOrderByFechaAsc(Integer idEmpleado, LocalDate fecha);
}