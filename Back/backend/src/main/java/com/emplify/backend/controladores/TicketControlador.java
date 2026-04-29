package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Ticket;
import com.emplify.backend.modelos.TicketMensaje;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.TicketRepo;
import com.emplify.backend.repositorios.TicketMensajeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

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
    private TicketMensajeRepo mensajeRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Obtiene los tickets del usuario logueado
    @GetMapping("/mis-tickets")
    public ResponseEntity<?> obtenerMisTickets(Principal principal) {
        Optional<Empleado> empOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (empOpt.isPresent()) {
            List<Ticket> misTickets = ticketRepo.findByEmpleado_IdEmpleadoOrderByFechaCreacionDesc(empOpt.get().getIdEmpleado());
            return ResponseEntity.ok(misTickets);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"No autorizado\"}");
    }

    // Obtiene un ticket por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerTicketPorId(@PathVariable Integer id) {
        return ticketRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Crea un nuevo ticket
    @PostMapping("/nuevo")
    public ResponseEntity<?> crearTicket(@RequestBody Ticket ticket, Principal principal) {
        // Validaciones previas
        if (ticket.getTitulo() == null || ticket.getTitulo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"El título es obligatorio\"}");
        }
        if (ticket.getDescripcion() == null || ticket.getDescripcion().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"La descripción es obligatoria\"}");
        }

        Optional<Empleado> empOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (empOpt.isPresent()) {
            ticket.setEmpleado(empOpt.get());
            ticket.setFechaCreacion(LocalDateTime.now());
            ticket.setEstado("PENDIENTE");

            Ticket guardado = ticketRepo.save(ticket);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"No autorizado\"}");
    }

    // Obtiene todos los tickets de la empresa
    @GetMapping("/todos")
    public ResponseEntity<?> obtenerTodosLosTickets(Principal principal) {
        Optional<Empleado> rrhhOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (rrhhOpt.isPresent()) {
            Integer idEmpresa = rrhhOpt.get().getEmpresa().getIdEmpresa();
            List<Ticket> ticketsEmpresa = ticketRepo.findByEmpleado_Empresa_IdEmpresaOrderByFechaCreacionDesc(idEmpresa);
            return ResponseEntity.ok(ticketsEmpresa);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"No autorizado\"}");
    }

    // Chat WebSockets: Enviar mensaje a un ticket
    @PostMapping("/{id}/enviar-mensaje")
    public ResponseEntity<?> enviarMensaje(@PathVariable Integer id, @RequestBody Map<String, String> body, Principal principal) {
        Optional<Ticket> ticketOpt = ticketRepo.findById(id);

        if (ticketOpt.isPresent()) {
            Optional<Empleado> autorOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

            if (autorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            if (!body.containsKey("contenido") || body.get("contenido").trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"El mensaje no puede estar vacío\"}");
            }

            TicketMensaje nuevoMsg = new TicketMensaje();
            nuevoMsg.setContenido(body.get("contenido"));
            nuevoMsg.setTicket(ticketOpt.get());
            nuevoMsg.setAutor(autorOpt.get());
            nuevoMsg.setFechaEnvio(LocalDateTime.now());

            TicketMensaje mensajeGuardado = mensajeRepo.save(nuevoMsg);

            // Emitimos al canal WebSocket
            messagingTemplate.convertAndSend("/topic/ticket/" + id, mensajeGuardado);

            return ResponseEntity.status(HttpStatus.CREATED).body(mensajeGuardado);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Ticket no encontrado\"}");
    }

    // Cambia el estado del ticket (RRHH)
    @PutMapping("/{id}/responder")
    public ResponseEntity<?> responderTicket(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Optional<Ticket> ticketOpt = ticketRepo.findById(id);

        if (ticketOpt.isPresent()) {
            if (!body.containsKey("estado")) {
                return ResponseEntity.badRequest().body("{\"error\": \"Se requiere el nuevo estado\"}");
            }

            Ticket ticket = ticketOpt.get();
            ticket.setEstado(body.get("estado"));
            ticketRepo.save(ticket);

            return ResponseEntity.ok("{\"mensaje\": \"Estado del ticket actualizado a " + body.get("estado") + "\"}");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Ticket no encontrado\"}");
    }
}