package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepo extends JpaRepository<Ticket, Integer> {

    // Sobrescribimos el método por defecto para que /todos devuelva los datos del empleado
    @Query("SELECT t FROM Ticket t JOIN FETCH t.empleado e JOIN FETCH e.usuario ORDER BY t.fechaCreacion DESC")
    List<Ticket> findAll();

    // Busca los tickets de un empleado y los ordena (el más nuevo primero)
    // Añade JOIN FETCH para asegurar que el FrontEnd reciba los datos del Empleado y del Usuario
    @Query("SELECT t FROM Ticket t JOIN FETCH t.empleado e JOIN FETCH e.usuario WHERE e.idEmpleado = :idEmpleado ORDER BY t.fechaCreacion DESC")
    List<Ticket> findByEmpleado_IdEmpleadoOrderByFechaCreacionDesc(@Param("idEmpleado") Integer idEmpleado);

    // Busca todos los tickets de la empresa para el panel de RRHH
    // Añade JOIN FETCH para que en el panel salga el nombre de quien envía el ticket
    @Query("SELECT t FROM Ticket t JOIN FETCH t.empleado e JOIN FETCH e.usuario WHERE e.empresa.idEmpresa = :idEmpresa ORDER BY t.fechaCreacion DESC")
    List<Ticket> findByEmpleado_Empresa_IdEmpresaOrderByFechaCreacionDesc(@Param("idEmpresa") Integer idEmpresa);
}