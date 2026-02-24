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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudControlador {

    @Autowired
    private SolicitudRepo solicitudRepo;

    @Autowired
    private TipoSolicitudRepo tipoSolicitudRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // 1. Obtener los tipos (Vacaciones, Bajas...) para el desplegable del móvil
    @GetMapping("/tipos")
    public ResponseEntity<List<TipoSolicitud>> obtenerTipos() {
        return ResponseEntity.ok(tipoSolicitudRepo.findAll());
    }

    // 2. Obtener el historial de solicitudes de un empleado
    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<List<Solicitud>> obtenerMisSolicitudes(@PathVariable Integer idEmpleado) {
        return ResponseEntity.ok(solicitudRepo.findByEmpleado_IdEmpleado(idEmpleado));
    }

    // 3. Crear una nueva solicitud desde la App Móvil
    @PostMapping("/nueva")
    public ResponseEntity<?> crearSolicitud(@RequestBody Map<String, Object> datos) {
        try {
            // Extraemos los datos del JSON que enviará Ionic
            Integer idEmpleado = (Integer) datos.get("idEmpleado");
            Integer idTipo = (Integer) datos.get("idTipo");
            String fechaInicioStr = (String) datos.get("fechaInicio");
            String fechaFinStr = (String) datos.get("fechaFin");

            // Buscamos el Empleado y el Tipo en la base de datos
            Empleado empleado = empleadoRepo.findById(idEmpleado).orElse(null);
            TipoSolicitud tipo = tipoSolicitudRepo.findById(idTipo).orElse(null);

            if (empleado == null || tipo == null) {
                return ResponseEntity.badRequest().body("Error: Empleado o Tipo de solicitud no existen.");
            }

            // Creamos la nueva solicitud y la rellenamos
            Solicitud nuevaSolicitud = new Solicitud();
            nuevaSolicitud.setEmpleado(empleado);
            nuevaSolicitud.setTipoSolicitud(tipo);
            nuevaSolicitud.setFechaInicio(LocalDate.parse(fechaInicioStr));
            nuevaSolicitud.setFechaFin(LocalDate.parse(fechaFinStr));

            // Regla de negocio: Siempre entran como PENDIENTE
            nuevaSolicitud.setEstado("PENDIENTE");
            nuevaSolicitud.setFechaSolicitud(LocalDateTime.now()); // Guarda el momento exacto en el que le dio al botón

            // La guardamos en MySQL
            solicitudRepo.save(nuevaSolicitud);

            return ResponseEntity.ok(nuevaSolicitud);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al crear la solicitud: " + e.getMessage());
        }
    }
}