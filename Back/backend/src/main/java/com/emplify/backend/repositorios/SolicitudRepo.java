package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepo extends JpaRepository<Solicitud, Integer> {

    // Busca todas las solicitudes de un empleado
    List<Solicitud> findByEmpleado_IdEmpleado(Integer idEmpleado);
}