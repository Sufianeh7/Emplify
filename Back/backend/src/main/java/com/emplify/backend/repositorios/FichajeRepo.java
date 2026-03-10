package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Fichaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FichajeRepo extends JpaRepository<Fichaje, Integer> {

    // Busca si el empleado tiene un fichaje a medias (ha entrado pero no ha salido)
    Optional<Fichaje> findFirstByEmpleado_IdEmpleadoAndHoraSalidaIsNullOrderByHoraEntradaDesc(Integer idEmpleado);

    // Saca todos los fichajes de un empleado entre dos fechas (para sacar los de "hoy")
    List<Fichaje> findByEmpleado_IdEmpleadoAndHoraEntradaBetweenOrderByHoraEntradaAsc(
            Integer idEmpleado, LocalDateTime inicioDia, LocalDateTime finDia);

    List<Fichaje> findByEmpleado_IdEmpleado(Integer idEmpleado);
}