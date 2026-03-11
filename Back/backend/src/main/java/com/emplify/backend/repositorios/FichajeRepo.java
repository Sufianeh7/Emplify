package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Fichaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FichajeRepo extends JpaRepository<Fichaje, Integer> {

    // Busca si el empleado tiene un turno abierto
    Optional<Fichaje> findFirstByEmpleado_IdEmpleadoAndHoraSalidaIsNullOrderByHoraEntradaDesc(Integer idEmpleado);

    // Fichajes de un día concreto
    List<Fichaje> findByEmpleado_IdEmpleadoAndHoraEntradaBetweenOrderByHoraEntradaAsc(
            Integer idEmpleado, LocalDateTime inicioDia, LocalDateTime finDia);

    // Histórico completo ordenado de más reciente a más antiguo
    List<Fichaje> findByEmpleado_IdEmpleadoOrderByHoraEntradaDesc(Integer idEmpleado);
}