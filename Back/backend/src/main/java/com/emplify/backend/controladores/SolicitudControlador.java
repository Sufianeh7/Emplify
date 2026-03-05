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
@CrossOrigin(origins = "http://localhost:8100")
public class SolicitudControlador {

    @Autowired
    private SolicitudRepo solicitudRepo;

    @Autowired
    private TipoSolicitudRepo tipoSolicitudRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    @Autowired
    private CuadranteRepo cuadranteRepo;

    @GetMapping("/tipos")
    public ResponseEntity<List<TipoSolicitud>> obtenerTipos() {
        return ResponseEntity.ok(tipoSolicitudRepo.findAll());
    }

    @GetMapping("/mis-solicitudes")
    public ResponseEntity<List<Solicitud>> obtenerHistorialPropio(Principal principal) {
        return ResponseEntity.ok(solicitudRepo.findByEmpleado_UsuarioEmailOrderByFechaSolicitudDesc(principal.getName()));
    }

    @PostMapping("/nueva")
    public ResponseEntity<?> crearSolicitud(@RequestBody Map<String, Object> datos, Principal principal) {
        try {
            if (datos.get("idTipo") == null) return ResponseEntity.badRequest().body("{\"error\": \"Falta idTipo\"}");
            Integer idTipo = Integer.parseInt(datos.get("idTipo").toString());

            Empleado empleado = empleadoRepo.findByUsuarioEmail(principal.getName()).orElse(null);
            TipoSolicitud tipo = tipoSolicitudRepo.findById(idTipo).orElse(null);

            if (empleado == null || tipo == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Empleado o Tipo no existen\"}");
            }

            // Convertimos directamente a LocalDate para el repositorio
            LocalDate inicio = LocalDate.parse(datos.get("fechaInicio").toString().split("T")[0]);
            LocalDate fin = LocalDate.parse(datos.get("fechaFin").toString().split("T")[0]);
            LocalDate hoy = LocalDate.now();

            if (inicio.isBefore(hoy)) {
                return ResponseEntity.badRequest().body("{\"error\": \"No puedes solicitar ausencia para fechas pasadas.\"}");
            }

            // 1. VALIDACIÓN DE SOLAPAMIENTO
            if (solicitudRepo.existeSolapamiento(empleado.getIdEmpleado(), inicio, fin)) {
                return ResponseEntity.badRequest().body("{\"error\": \"Ya tienes una solicitud pendiente o aprobada que coincide con estas fechas.\"}");
            }

            // 2. VALIDACIÓN DE DÍAS LABORALES (Pasamos objetos LocalDate directamente)
            List<Cuadrante> turnosEnRango = cuadranteRepo.findByEmpleado_IdEmpleadoAndFechaBetween(
                    empleado.getIdEmpleado(), inicio, fin
            );

            long diasLaborales = turnosEnRango.stream()
                    .filter(t -> !t.getTurno().equalsIgnoreCase("LIBRE"))
                    .count();

            if (diasLaborales == 0) {
                return ResponseEntity.badRequest().body("{\"error\": \"No tienes turnos de trabajo en el rango seleccionado.\"}");
            }

            // 3. VALIDACIÓN DE SALDO DE DÍAS
            String nombreTipo = tipo.getNombre().toUpperCase();
            if (nombreTipo.contains("VACACIONES")) {
                if (empleado.getVacacionesDisponibles() < diasLaborales) {
                    return ResponseEntity.badRequest().body("{\"error\": \"Días insuficientes de Vacaciones. Disponibles: " + empleado.getVacacionesDisponibles() + "\"}");
                }
            } else if (nombreTipo.contains("ASUNTOS") || nombreTipo.contains("PROPIOS")) {
                if (empleado.getAsuntosPropiosDisponibles() < diasLaborales) {
                    return ResponseEntity.badRequest().body("{\"error\": \"Días insuficientes de Asuntos Propios. Disponibles: " + empleado.getAsuntosPropiosDisponibles() + "\"}");
                }
            }

            // 4. GUARDAR SOLICITUD
            Solicitud nuevaSolicitud = new Solicitud();
            nuevaSolicitud.setEmpleado(empleado);
            nuevaSolicitud.setTipoSolicitud(tipo);
            nuevaSolicitud.setFechaInicio(inicio);
            nuevaSolicitud.setFechaFin(fin);
            nuevaSolicitud.setComentarios((String) datos.get("comentarios"));
            nuevaSolicitud.setEstado("PENDIENTE");
            nuevaSolicitud.setFechaSolicitud(LocalDateTime.now());

            return ResponseEntity.ok(solicitudRepo.save(nuevaSolicitud));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Error de formato: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/equipo/pendientes")
    public ResponseEntity<?> obtenerSolicitudesEquipo(Principal principal) {
        Optional<Empleado> managerOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        if (managerOpt.isPresent()) {
            Integer idManager = managerOpt.get().getIdEmpleado();
            List<Solicitud> pendientes = solicitudRepo.findByEmpleado_Manager_IdEmpleadoAndEstado(idManager, "PENDIENTE");
            return ResponseEntity.ok(pendientes);
        }
        return ResponseEntity.status(401).body("No autorizado");
    }

    @Transactional
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoSolicitud(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Optional<Solicitud> solOpt = solicitudRepo.findById(id);

        if (solOpt.isPresent()) {
            Solicitud solicitud = solOpt.get();
            String nuevoEstado = body.get("estado");

            if ("APROBADA".equals(nuevoEstado) && !"APROBADA".equals(solicitud.getEstado())) {
                Empleado empleado = solicitud.getEmpleado();

                // Buscamos usando LocalDate (campos nativos de la entidad Solicitud)
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
            return ResponseEntity.ok("{\"mensaje\": \"Estado actualizado y cuadrante limpiado\"}");
        }
        return ResponseEntity.status(404).body("{\"error\": \"No encontrada\"}");
    }
}