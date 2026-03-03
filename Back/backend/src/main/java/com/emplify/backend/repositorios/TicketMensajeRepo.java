package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.TicketMensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketMensajeRepo extends JpaRepository<TicketMensaje, Integer> {
    // Busca todos los mensajes de un ticket específico ordenados por fecha
    List<TicketMensaje> findByTicket_IdTicketOrderByFechaEnvioAsc(Integer idTicket);
}