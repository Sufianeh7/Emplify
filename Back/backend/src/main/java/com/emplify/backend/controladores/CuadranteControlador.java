package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Cuadrante;
import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.repositorios.CuadranteRepo;
import com.emplify.backend.repositorios.EmpleadoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cuadrante")
@CrossOrigin(origins = "http://localhost:8100")
public class CuadranteControlador {

    @Autowired
    private CuadranteRepo cuadranteRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // 1. OBTENER CUADRANTE DE UN EMPLEADO (Con validación de empresa)
    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<?> obtenerCuadrantePorEmpleado(@PathVariable Integer idEmpleado, Principal principal) {

        Optional<Empleado> consultanteOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        Optional<Empleado> objetivoOpt = empleadoRepo.findById(idEmpleado);

        if (consultanteOpt.isPresent() && objetivoOpt.isPresent()) {
            Empleado consultante = consultanteOpt.get();
            Empleado objetivo = objetivoOpt.get();

            if (!consultante.getEmpresa().getIdEmpresa().equals(objetivo.getEmpresa().getIdEmpresa())) {
                return ResponseEntity.status(403).body("{\"error\": \"No tienes permiso para ver cuadrantes de otra empresa\"}");
            }

            List<Cuadrante> turnos = cuadranteRepo.findByEmpleado_IdEmpleado(idEmpleado);
            return ResponseEntity.ok(turnos);
        }

        return ResponseEntity.status(404).body("{\"error\": \"Empleado no encontrado\"}");
    }

    // 2. ASIGNAR O ACTUALIZAR UN TURNO (Seguridad multi-empresa)
    @PostMapping("/asignar")
    public ResponseEntity<?> asignarTurno(@RequestBody Cuadrante nuevoTurno, Principal principal) {

        Optional<Empleado> autorOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        Optional<Empleado> receptorOpt = empleadoRepo.findById(nuevoTurno.getEmpleado().getIdEmpleado());

        if (autorOpt.isPresent() && receptorOpt.isPresent()) {
            Empleado autor = autorOpt.get();
            Empleado receptor = receptorOpt.get();

            if (autor.getEmpresa().getIdEmpresa().equals(receptor.getEmpresa().getIdEmpresa())) {
                Cuadrante guardado = cuadranteRepo.save(nuevoTurno);
                return ResponseEntity.ok(guardado);
            } else {
                return ResponseEntity.status(403).body("{\"error\": \"Intento de asignación cross-company detectado\"}");
            }
        }

        return ResponseEntity.status(400).body("{\"error\": \"Datos de asignación no válidos\"}");
    }

    // 3. OBTENER TODOS LOS EMPLEADOS DE MI EMPRESA (Para el desplegable del cuadrante)
    @GetMapping("/mis-empleados")
    public ResponseEntity<?> obtenerMisEmpleados(Principal principal) {
        Optional<Empleado> rrhhOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (rrhhOpt.isPresent()) {
            Integer idEmpresa = rrhhOpt.get().getEmpresa().getIdEmpresa();
            List<Empleado> misEmpleados = empleadoRepo.findByEmpresa_IdEmpresa(idEmpresa);
            return ResponseEntity.ok(misEmpleados);
        }

        return ResponseEntity.status(401).body("{\"error\": \"No autorizado\"}");
    }

    // ==========================================
    // 4. NUEVO: ASIGNACIÓN MASIVA DE TURNOS
    // ==========================================
    @PostMapping("/asignar-masivo")
    public ResponseEntity<?> asignarTurnosMasivo(@RequestBody List<Cuadrante> nuevosTurnos, Principal principal) {

        Optional<Empleado> autorOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        if (autorOpt.isEmpty()) {
            return ResponseEntity.status(401).body("{\"error\": \"No autorizado\"}");
        }

        Empleado autor = autorOpt.get();
        Integer idEmpresaAutor = autor.getEmpresa().getIdEmpresa();

        // Lista para guardar los turnos validados
        List<Cuadrante> turnosAprobados = new ArrayList<>();

        // Validamos TODOS los turnos antes de guardar nada en base de datos
        for (Cuadrante turno : nuevosTurnos) {
            Optional<Empleado> receptorOpt = empleadoRepo.findById(turno.getEmpleado().getIdEmpleado());

            if (receptorOpt.isEmpty() || !receptorOpt.get().getEmpresa().getIdEmpresa().equals(idEmpresaAutor)) {
                // Si encontramos un solo fraude, bloqueamos toda la operación
                return ResponseEntity.status(403).body("{\"error\": \"Intento de asignación a un empleado no válido o de otra empresa. Operación abortada.\"}");
            }

            // Si es válido, nos aseguramos de asignar el objeto Empleado completo al turno
            turno.setEmpleado(receptorOpt.get());
            turnosAprobados.add(turno);
        }

        // Si el bucle termina sin errores, es que todos son de la misma empresa. Guardamos de golpe.
        List<Cuadrante> guardados = cuadranteRepo.saveAll(turnosAprobados);

        return ResponseEntity.ok("{\"mensaje\": \"Se han asignado " + guardados.size() + " turnos correctamente.\"}");
    }
}