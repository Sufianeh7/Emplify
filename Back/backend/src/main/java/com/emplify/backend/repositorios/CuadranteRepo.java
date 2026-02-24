package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Cuadrante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuadranteRepo extends JpaRepository<Cuadrante, Integer> {

    //Busca todos los turnos de un empleado específico
    List<Cuadrante> findByEmpleado_IdEmpleado(Integer idEmpleado);
}