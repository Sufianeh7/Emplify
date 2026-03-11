package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.TicketMensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketMensajeRepo extends JpaRepository<TicketMensaje, Integer> {

    // Busca el historial completo de chat de un ticket, ordenado del más antiguo al más nuevo
    List<TicketMensaje> findByTicket_IdTicketOrderByFechaEnvioAsc(Integer idTicket);
}