package com.emplify.backend.controladores;

import com.emplify.backend.dto.TurnoDTO;
import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Turno;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.TurnoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/turnos")
@CrossOrigin(origins = "http://localhost:8100")
public class TurnoControlador {

    @Autowired
    private TurnoRepo turnoRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // 1. Obtener los turnos del empleado que ha iniciado sesión
    @GetMapping("/mis-turnos")
    public ResponseEntity<List<Turno>> misTurnos(
            Principal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        // SOLUCIÓN: Usamos findByUsuarioEmail porque principal.getName() trae el email del usuario logueado
        Empleado empleado = empleadoRepo.findByUsuarioEmail(principal.getName()).orElse(null);

        // Si el empleado no existe, esto era lo que lanzaba el 404
        if (empleado == null) {
            return ResponseEntity.notFound().build();
        }

        List<Turno> turnos = turnoRepo.findByEmpleado_IdEmpleadoAndFechaBetweenOrderByFechaAsc(
                empleado.getIdEmpleado(), inicio, fin);

        return ResponseEntity.ok(turnos);
    }

    // 2. Obtener el cuadrante completo (Para RRHH)
    @GetMapping("/cuadrante")
    public ResponseEntity<List<Turno>> obtenerCuadrante(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        return ResponseEntity.ok(turnoRepo.findByFechaBetweenOrderByFechaAsc(inicio, fin));
    }

    // 3. ASIGNACIÓN MASIVA (Para RRHH)
    @PostMapping("/asignar-masivo")
    @Transactional // Si falla uno, no se guarda ninguno (seguridad de datos)
    public ResponseEntity<?> asignarTurnosMasivos(@RequestBody List<TurnoDTO> peticiones) {
        List<Turno> turnosAGuardar = new ArrayList<>();

        for (TurnoDTO dto : peticiones) {
            Empleado empleado = empleadoRepo.findById(dto.getIdEmpleado()).orElse(null);
            if (empleado != null) {
                turnosAGuardar.add(new Turno(dto.getFecha(), dto.getTipo(), empleado));
            }
        }

        // Podríamos borrar los previos para no duplicar, pero de momento guardamos directo
        turnoRepo.saveAll(turnosAGuardar);

        return ResponseEntity.ok().body("{\"mensaje\": \"Turnos asignados correctamente\"}");
    }
}