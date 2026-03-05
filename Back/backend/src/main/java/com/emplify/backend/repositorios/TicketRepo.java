package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepo extends JpaRepository<Ticket, Integer> {

    // Busca los tickets de un empleado y los ordena para que el más nuevo salga primero
    List<Ticket> findByEmpleado_IdEmpleadoOrderByFechaCreacionDesc(Integer idEmpleado);

    // NUEVO: Busca todos los tickets de los empleados que pertenecen a una EMPRESA concreta
    List<Ticket> findByEmpleado_Empresa_IdEmpresaOrderByFechaCreacionDesc(Integer idEmpresa);
}