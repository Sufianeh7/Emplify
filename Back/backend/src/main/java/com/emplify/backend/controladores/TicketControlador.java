package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Ticket;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.TicketRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
public class TicketControlador {

    @Autowired
    private TicketRepo ticketRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // Obtener SOLO los tickets del usuario logueado
    @GetMapping("/mis-tickets")
    public ResponseEntity<?> obtenerMisTickets(Principal principal) {
        // Buscamos quién es el empleado a través de su email (token)
        Optional<Empleado> emp = empleadoRepo.findByUsuarioEmail(principal.getName());

        if(emp.isPresent()) {
            List<Ticket> misTickets = ticketRepo.findByEmpleado_IdEmpleadoOrderByFechaCreacionDesc(emp.get().getIdEmpleado());
            return ResponseEntity.ok(misTickets);
        }
        return ResponseEntity.status(401).body("No autorizado");
    }

    // Crear un nuevo ticket
    @PostMapping("/nuevo")
    public ResponseEntity<?> crearTicket(@RequestBody Ticket ticket, Principal principal) {
        Optional<Empleado> emp = empleadoRepo.findByUsuarioEmail(principal.getName());

        if(emp.isPresent()) {
            ticket.setEmpleado(emp.get()); // Le asignamos el autor automáticamente
            ticket.setFechaCreacion(LocalDateTime.now());
            ticket.setEstado("PENDIENTE"); // Todo ticket nace como PENDIENTE

            return ResponseEntity.ok(ticketRepo.save(ticket));
        }
        return ResponseEntity.status(401).body("No autorizado");
    }
}