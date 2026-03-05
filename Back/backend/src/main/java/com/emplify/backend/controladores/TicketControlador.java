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
@CrossOrigin(origins = "http://localhost:8100") // Aseguramos que Ionic pueda comunicarse
public class TicketControlador {

    @Autowired
    private TicketRepo ticketRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    @Autowired
    private TicketMensajeRepo mensajeRepo;

    // 1. Obtener SOLO los tickets del usuario logueado
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

    // 2. Crear un nuevo ticket
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

    // 3. Obtener TODOS los tickets DE MI EMPRESA (Vista RRHH Blindada) <--- AQUÍ ESTÁ LA MAGIA
    @GetMapping("/todos")
    public ResponseEntity<?> obtenerTodosLosTickets(Principal principal) {
        Optional<Empleado> rrhhOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if(rrhhOpt.isPresent()) {
            Integer idEmpresa = rrhhOpt.get().getEmpresa().getIdEmpresa();
            // Filtramos los tickets para que solo salgan los de SU empresa
            List<Ticket> ticketsEmpresa = ticketRepo.findByEmpleado_Empresa_IdEmpresaOrderByFechaCreacionDesc(idEmpresa);
            return ResponseEntity.ok(ticketsEmpresa);
        }
        return ResponseEntity.status(401).body("{\"error\": \"No autorizado\"}");
    }

    // 4. Enviar un mensaje al chat del ticket
    @PostMapping("/{id}/enviar-mensaje")
    public ResponseEntity<?> enviarMensaje(@PathVariable Integer id, @RequestBody Map<String, String> body, Principal principal) {
        Optional<Ticket> ticketOpt = ticketRepo.findById(id);

        if (ticketOpt.isPresent()) {
            Empleado autor = empleadoRepo.findByUsuarioEmail(principal.getName()).orElse(null);

            if (autor == null) return ResponseEntity.status(401).build();

            TicketMensaje nuevoMsg = new TicketMensaje();
            nuevoMsg.setContenido(body.get("contenido"));
            nuevoMsg.setTicket(ticketOpt.get());
            nuevoMsg.setAutor(autor);

            mensajeRepo.save(nuevoMsg);
            return ResponseEntity.ok("{\"mensaje\": \"Mensaje enviado\"}");
        }
        return ResponseEntity.status(404).build();
    }

    // 5. Responder a un ticket / Cambiar estado
    @PutMapping("/{id}/responder")
    public ResponseEntity<?> responderTicket(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Optional<Ticket> ticketOpt = ticketRepo.findById(id);

        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            ticket.setEstado(body.get("estado"));
            ticketRepo.save(ticket);
            return ResponseEntity.ok("{\"mensaje\": \"Ticket actualizado con éxito\"}");
        }
        return ResponseEntity.status(404).body("{\"error\": \"Ticket no encontrado\"}");
    }
}