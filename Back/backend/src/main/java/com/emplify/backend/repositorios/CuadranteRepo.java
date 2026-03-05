package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Cuadrante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CuadranteRepo extends JpaRepository<Cuadrante, Integer> {

    List<Cuadrante> findByEmpleado_IdEmpleado(Integer idEmpleado);

    // Cambiamos String por LocalDate
    Optional<Cuadrante> findByEmpleado_IdEmpleadoAndFecha(Integer idEmpleado, LocalDate fecha);

    // Cambiamos String por LocalDate en los parámetros de rango
    List<Cuadrante> findByEmpleado_IdEmpleadoAndFechaBetween(Integer idEmpleado, LocalDate inicio, LocalDate fin);
}