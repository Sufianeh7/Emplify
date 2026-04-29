package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Solicitud;
import com.emplify.backend.modelos.TipoSolicitud;
import com.emplify.backend.modelos.Cuadrante;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.SolicitudRepo;
import com.emplify.backend.repositorios.TipoSolicitudRepo;
import com.emplify.backend.repositorios.CuadranteRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

    @Autowired
    private CuadranteRepo cuadranteRepo;

    // Obtiene los tipos de solicitud disponibles
    @GetMapping("/tipos")
    public ResponseEntity<List<TipoSolicitud>> obtenerTipos() {
        return ResponseEntity.ok(tipoSolicitudRepo.findAll());
    }

    // Historial del empleado logueado
    @GetMapping("/mis-solicitudes")
    public ResponseEntity<List<Solicitud>> obtenerHistorialPropio(Principal principal) {
        return ResponseEntity.ok(solicitudRepo.findByEmpleado_UsuarioEmailOrderByFechaSolicitudDesc(principal.getName()));
    }

    // Crea una nueva solicitud con múltiples validaciones
    @PostMapping("/nueva")
    public ResponseEntity<?> crearSolicitud(@RequestBody Map<String, Object> datos, Principal principal) {
        try {
            if (!datos.containsKey("idTipo") || !datos.containsKey("fechaInicio") || !datos.containsKey("fechaFin")) {
                return ResponseEntity.badRequest().body("{\"error\": \"Faltan datos obligatorios\"}");
            }

            Integer idTipo = Integer.parseInt(datos.get("idTipo").toString());
            Optional<Empleado> empleadoOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
            Optional<TipoSolicitud> tipoOpt = tipoSolicitudRepo.findById(idTipo);

            if (empleadoOpt.isEmpty() || tipoOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Empleado o Tipo de solicitud no válidos\"}");
            }

            Empleado empleado = empleadoOpt.get();
            TipoSolicitud tipo = tipoOpt.get();

            LocalDate inicio = LocalDate.parse(datos.get("fechaInicio").toString().split("T")[0]);
            LocalDate fin = LocalDate.parse(datos.get("fechaFin").toString().split("T")[0]);

            if (inicio.isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body("{\"error\": \"No puedes solicitar ausencia para fechas pasadas.\"}");
            }

            // 1. Valida solapamientos
            if (solicitudRepo.existeSolapamiento(empleado.getIdEmpleado(), inicio, fin)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("{\"error\": \"Ya tienes una solicitud pendiente o aprobada en estas fechas.\"}");
            }

            // 2. Valida que tenga turnos laborales asignados en ese rango
            List<Cuadrante> turnosEnRango = cuadranteRepo.findByEmpleado_IdEmpleadoAndFechaBetween(
                    empleado.getIdEmpleado(), inicio, fin
            );

            long diasLaborales = turnosEnRango.stream()
                    .filter(t -> !t.getTurno().equalsIgnoreCase("LIBRE"))
                    .count();

            if (diasLaborales == 0) {
                return ResponseEntity.badRequest().body("{\"error\": \"No tienes turnos de trabajo asignados en el rango seleccionado.\"}");
            }

            // 3. Valida saldo disponible según el tipo
            String nombreTipo = tipo.getNombre().toUpperCase();
            if (nombreTipo.contains("VACACIONES") && empleado.getVacacionesDisponibles() < diasLaborales) {
                return ResponseEntity.badRequest().body("{\"error\": \"Días insuficientes. Disponibles: " + empleado.getVacacionesDisponibles() + "\"}");
            } else if ((nombreTipo.contains("ASUNTOS") || nombreTipo.contains("PROPIOS")) && empleado.getAsuntosPropiosDisponibles() < diasLaborales) {
                return ResponseEntity.badRequest().body("{\"error\": \"Días insuficientes. Disponibles: " + empleado.getAsuntosPropiosDisponibles() + "\"}");
            }

            // 4. Guarda
            Solicitud nuevaSolicitud = new Solicitud();
            nuevaSolicitud.setEmpleado(empleado);
            nuevaSolicitud.setTipoSolicitud(tipo);
            nuevaSolicitud.setFechaInicio(inicio);
            nuevaSolicitud.setFechaFin(fin);
            nuevaSolicitud.setComentarios((String) datos.getOrDefault("comentarios", ""));
            nuevaSolicitud.setEstado("PENDIENTE");
            nuevaSolicitud.setFechaSolicitud(LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.CREATED).body(solicitudRepo.save(nuevaSolicitud));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error al procesar la solicitud\"}");
        }
    }

    // Obtiene solicitudes pendientes del equipo a cargo
    @GetMapping("/equipo/pendientes")
    public ResponseEntity<?> obtenerSolicitudesEquipo(Principal principal) {
        Optional<Empleado> managerOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (managerOpt.isPresent()) {
            List<Solicitud> pendientes = solicitudRepo.findByEmpleado_Manager_IdEmpleadoAndEstado(managerOpt.get().getIdEmpleado(), "PENDIENTE");
            return ResponseEntity.ok(pendientes);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"No autorizado\"}");
    }

    // Aprueba o rechazaa una solicitud (Actualiza saldo y limpia cuadrante)
    @Transactional
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoSolicitud(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Optional<Solicitud> solOpt = solicitudRepo.findById(id);

        if (solOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Solicitud no encontrada\"}");
        }

        Solicitud solicitud = solOpt.get();
        String nuevoEstado = body.get("estado");

        // Si se APRUEBA por primera vez, se descuentan días y limpia el cuadrante
        if ("APROBADA".equals(nuevoEstado) && !"APROBADA".equals(solicitud.getEstado())) {
            Empleado empleado = solicitud.getEmpleado();

            List<Cuadrante> turnosBorrar = cuadranteRepo.findByEmpleado_IdEmpleadoAndFechaBetween(
                    empleado.getIdEmpleado(),
                    solicitud.getFechaInicio(),
                    solicitud.getFechaFin()
            );

            long diasADescontar = turnosBorrar.stream()
                    .filter(t -> !t.getTurno().equalsIgnoreCase("LIBRE"))
                    .count();

            String nombreTipo = solicitud.getTipoSolicitud().getNombre().toUpperCase();

            if (nombreTipo.contains("VACACIONES")) {
                empleado.setVacacionesDisponibles(empleado.getVacacionesDisponibles() - (int)diasADescontar);
            } else if (nombreTipo.contains("ASUNTOS") || nombreTipo.contains("PROPIOS")) {
                empleado.setAsuntosPropiosDisponibles(empleado.getAsuntosPropiosDisponibles() - (int)diasADescontar);
            }

            if (!turnosBorrar.isEmpty()) {
                cuadranteRepo.deleteAll(turnosBorrar);
            }
            empleadoRepo.save(empleado);
        }

        solicitud.setEstado(nuevoEstado);
        solicitudRepo.save(solicitud);
        return ResponseEntity.ok("{\"mensaje\": \"Estado de la solicitud actualizado correctamente\"}");
    }
}