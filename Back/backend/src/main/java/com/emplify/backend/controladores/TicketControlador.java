package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Ticket;
import com.emplify.backend.modelos.TicketMensaje;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.TicketRepo;
import com.emplify.backend.repositorios.TicketMensajeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketControlador {

    @Autowired
    private TicketRepo ticketRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    @Autowired
    private TicketMensajeRepo mensajeRepo; // Nuevo repositorio para el chat

    // 1. Obtener SOLO los tickets del usuario logueado (Mantenido)
    @GetMapping("/mis-tickets")
    public ResponseEntity<?> obtenerMisTickets(Principal principal) {
        Optional<Empleado> emp = empleadoRepo.findByUsuarioEmail(principal.getName());

        if(emp.isPresent()) {
            List<Ticket> misTickets = ticketRepo.findByEmpleado_IdEmpleadoOrderByFechaCreacionDesc(emp.get().getIdEmpleado());
            return ResponseEntity.ok(misTickets);
        }
        return ResponseEntity.status(401).body("No autorizado");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> obtenerTicketPorId(@PathVariable Integer id) {
        return ticketRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. Crear un nuevo ticket (Mantenido)
    @PostMapping("/nuevo")
    public ResponseEntity<?> crearTicket(@RequestBody Ticket ticket, Principal principal) {
        Optional<Empleado> emp = empleadoRepo.findByUsuarioEmail(principal.getName());

        if(emp.isPresent()) {
            ticket.setEmpleado(emp.get());
            ticket.setFechaCreacion(LocalDateTime.now());
            ticket.setEstado("PENDIENTE");

            return ResponseEntity.ok(ticketRepo.save(ticket));
        }
        return ResponseEntity.status(401).body("No autorizado");
    }

    // 3. Obtener TODOS los tickets (Mantenido - Vista RRHH)
    @GetMapping("/todos")
    public ResponseEntity<?> obtenerTodosLosTickets() {
        List<Ticket> todos = ticketRepo.findAll();
        return ResponseEntity.ok(todos);
    }

    // 4. NUEVO: Enviar un mensaje al chat del ticket
    @PostMapping("/{id}/enviar-mensaje")
    public ResponseEntity<?> enviarMensaje(@PathVariable Integer id, @RequestBody Map<String, String> body, Principal principal) {
        Optional<Ticket> ticketOpt = ticketRepo.findById(id);

        if (ticketOpt.isPresent()) {
            // Buscamos al autor (quien escribe) por su token
            Empleado autor = empleadoRepo.findByUsuarioEmail(principal.getName()).orElse(null);

            if (autor == null) return ResponseEntity.status(401).build();

            TicketMensaje nuevoMsg = new TicketMensaje();
            nuevoMsg.setContenido(body.get("contenido"));
            nuevoMsg.setTicket(ticketOpt.get());
            nuevoMsg.setAutor(autor);

            mensajeRepo.save(nuevoMsg); // Se guarda en la tabla independiente
            return ResponseEntity.ok("{\"mensaje\": \"Mensaje enviado\"}");
        }
        return ResponseEntity.status(404).build();
    }

    // 5. Responder a un ticket / Cambiar estado (Mantenido)
    @PutMapping("/{id}/responder")
    public ResponseEntity<?> responderTicket(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Optional<Ticket> ticketOpt = ticketRepo.findById(id);

        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            ticket.setEstado(body.get("estado")); // Recibe "RESUELTO" o "EN PROCESO"
            ticketRepo.save(ticket);
            return ResponseEntity.ok("{\"mensaje\": \"Ticket actualizado con éxito\"}");
        }
        return ResponseEntity.status(404).body("{\"error\": \"Ticket no encontrado\"}");
    }


}