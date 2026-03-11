package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SolicitudRepo extends JpaRepository<Solicitud, Integer> {

    // Obtiene el historial completo de un empleado por su email
    List<Solicitud> findByEmpleado_UsuarioEmailOrderByFechaSolicitudDesc(String email);

    // Permite al mánager ver las peticiones de su equipo filtradas por estado
    List<Solicitud> findByEmpleado_Manager_IdEmpleadoAndEstado(Integer idManager, String estado);

    // Validación JPQL: Comprueba si ya existe una solicitud activa en el rango de fechas indicado
    @Query("SELECT COUNT(s) > 0 FROM Solicitud s " +
            "WHERE s.empleado.idEmpleado = :idEmpleado " +
            "AND s.estado != 'RECHAZADA' " +
            "AND (s.fechaInicio <= :fechaFin AND s.fechaFin >= :fechaInicio)")
    boolean existeSolapamiento(
            @Param("idEmpleado") Integer idEmpleado,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );
}