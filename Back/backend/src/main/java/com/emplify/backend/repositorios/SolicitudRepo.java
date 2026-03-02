package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepo extends JpaRepository<Solicitud, Integer> {

    // Método para el empleado base
    List<Solicitud> findByEmpleado_IdEmpleado(Integer idEmpleado);

    // Método para el mánager (¡Este es el que tiene que coincidir!)
    List<Solicitud> findByEmpleado_Manager_IdEmpleadoAndEstado(Integer idManager, String estado);
}