package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Solicitud;
import com.emplify.backend.modelos.TipoSolicitud;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.SolicitudRepo;
import com.emplify.backend.repositorios.TipoSolicitudRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudControlador {

    @Autowired
    private SolicitudRepo solicitudRepo;

    @Autowired
    private TipoSolicitudRepo tipoSolicitudRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // 1. Obtener los tipos para el desplegable (Mantiene tu lógica)
    @GetMapping("/tipos")
    public ResponseEntity<List<TipoSolicitud>> obtenerTipos() {
        return ResponseEntity.ok(tipoSolicitudRepo.findAll());
    }

    // 2. Obtener historial (Mantiene tu lógica)
    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<List<Solicitud>> obtenerMisSolicitudes(@PathVariable Integer idEmpleado) {
        return ResponseEntity.ok(solicitudRepo.findByEmpleado_IdEmpleado(idEmpleado));
    }

    // 3. Crear nueva solicitud (Mantiene tu lógica)
    @PostMapping("/nueva")
    public ResponseEntity<?> crearSolicitud(@RequestBody Map<String, Object> datos) {
        try {
            Integer idEmpleado = (Integer) datos.get("idEmpleado");
            Integer idTipo = (Integer) datos.get("idTipo");
            String fechaInicioStr = (String) datos.get("fechaInicio");
            String fechaFinStr = (String) datos.get("fechaFin");

            Empleado empleado = empleadoRepo.findById(idEmpleado).orElse(null);
            TipoSolicitud tipo = tipoSolicitudRepo.findById(idTipo).orElse(null);

            if (empleado == null || tipo == null) {
                return ResponseEntity.badRequest().body("Error: Empleado o Tipo no existen.");
            }

            Solicitud nuevaSolicitud = new Solicitud();
            nuevaSolicitud.setEmpleado(empleado);
            nuevaSolicitud.setTipoSolicitud(tipo);
            nuevaSolicitud.setFechaInicio(LocalDate.parse(fechaInicioStr));
            nuevaSolicitud.setFechaFin(LocalDate.parse(fechaFinStr));
            nuevaSolicitud.setEstado("PENDIENTE");
            nuevaSolicitud.setFechaSolicitud(LocalDateTime.now());

            return ResponseEntity.ok(solicitudRepo.save(nuevaSolicitud));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // ==========================================
    //        NUEVOS MÉTODOS PARA EL MÁNGER
    // ==========================================

    // 4. Obtener peticiones PENDIENTES del equipo (Seguro por Principal)
    @GetMapping("/equipo/pendientes")
    public ResponseEntity<?> obtenerSolicitudesEquipo(Principal principal) {
        Optional<Empleado> managerOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        if (managerOpt.isPresent()) {
            Integer idManager = managerOpt.get().getIdEmpleado();
            // Asegúrate de que el repositorio tenga este método exactamente
            List<Solicitud> pendientes = solicitudRepo.findByEmpleado_Manager_IdEmpleadoAndEstado(idManager, "PENDIENTE");
            return ResponseEntity.ok(pendientes);
        }
        return ResponseEntity.status(401).body("No autorizado");
    }

    // 5. Aprobar o Rechazar (PUT)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoSolicitud(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Optional<Solicitud> solOpt = solicitudRepo.findById(id);
        if (solOpt.isPresent()) {
            Solicitud solicitud = solOpt.get();
            solicitud.setEstado(body.get("estado"));
            solicitudRepo.save(solicitud);
            return ResponseEntity.ok("{\"mensaje\": \"Estado actualizado\"}");
        }
        return ResponseEntity.status(404).body("{\"error\": \"No encontrada\"}");
    }
}