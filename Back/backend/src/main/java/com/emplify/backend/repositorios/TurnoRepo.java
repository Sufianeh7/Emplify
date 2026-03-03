package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TurnoRepo extends JpaRepository<Turno, Integer> {

    // Para ver los turnos de UN empleado (útil para la app del trabajador)
    List<Turno> findByEmpleado_IdEmpleadoAndFechaBetweenOrderByFechaAsc(Integer idEmpleado, LocalDate inicio, LocalDate fin);

    // Para ver los turnos de TODOS los empleados (útil para RRHH)
    List<Turno> findByFechaBetweenOrderByFechaAsc(LocalDate inicio, LocalDate fin);

    // Para borrar turnos existentes antes de sobrescribirlos (evita duplicados)
    void deleteByEmpleado_IdEmpleadoAndFechaIn(Integer idEmpleado, List<LocalDate> fechas);

    List<Turno> findByEmpleado_IdEmpleadoAndFechaBetween(Integer idEmpleado, LocalDate inicio, LocalDate fin);
}