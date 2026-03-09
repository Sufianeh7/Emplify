package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Cuadrante;
import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.repositorios.CuadranteRepo;
import com.emplify.backend.repositorios.EmpleadoRepo;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cuadrante") // ¡Ojo! Está en singular
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

    // 4. ASIGNACIÓN MASIVA DE TURNOS (Con Upsert)
    @Transactional // <--- MUY IMPORTANTE PARA QUE LA BBDD GUARDE DE VERDAD
    @PostMapping("/asignar-masivo")
    public ResponseEntity<?> asignarTurnosMasivo(@RequestBody List<Cuadrante> nuevosTurnos, Principal principal) {

        // DEBUG: Para ver en tu consola si llegan datos vacíos o llenos
        System.out.println("🚀 Han llegado " + nuevosTurnos.size() + " turnos para guardar del frontend.");

        Optional<Empleado> autorOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        if (autorOpt.isEmpty()) {
            return ResponseEntity.status(401).body("{\"error\": \"No autorizado\"}");
        }

        Empleado autor = autorOpt.get();
        Integer idEmpresaAutor = autor.getEmpresa().getIdEmpresa();

        List<Cuadrante> turnosAprobados = new ArrayList<>();

        for (Cuadrante turno : nuevosTurnos) {
            Optional<Empleado> receptorOpt = empleadoRepo.findById(turno.getEmpleado().getIdEmpleado());

            if (receptorOpt.isEmpty() || !receptorOpt.get().getEmpresa().getIdEmpresa().equals(idEmpresaAutor)) {
                return ResponseEntity.status(403).body("{\"error\": \"Intento de asignación a empleado no válido.\"}");
            }

            Optional<Cuadrante> turnoExistente = cuadranteRepo.findByEmpleado_IdEmpleadoAndFecha(
                    receptorOpt.get().getIdEmpleado(),
                    turno.getFecha()
            );

            if (turnoExistente.isPresent()) {
                Cuadrante actualizar = turnoExistente.get();
                // OJO: Asegúrate de que en el modelo Java se llama "setTurno"
                actualizar.setTurno(turno.getTurno());
                turnosAprobados.add(actualizar);
            } else {
                turno.setEmpleado(receptorOpt.get());
                turnosAprobados.add(turno);
            }
        }

        List<Cuadrante> guardados = cuadranteRepo.saveAll(turnosAprobados);

        // DEBUG
        System.out.println("✅ Se han guardado " + guardados.size() + " turnos en la BBDD.");

        return ResponseEntity.ok("{\"mensaje\": \"Se han procesado " + guardados.size() + " turnos correctamente.\"}");
    }

    // ==========================================
    // 5. NUEVO: OBTENER EL PRÓXIMO TURNO DEL EMPLEADO
    // ==========================================
    @GetMapping("/proximo/{idEmpleado}")
    public ResponseEntity<?> obtenerProximoTurno(@PathVariable Integer idEmpleado, Principal principal) {
        // Validamos que el usuario existe
        Optional<Empleado> consultanteOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        if (consultanteOpt.isEmpty()) {
            return ResponseEntity.status(401).body("{\"error\": \"No autorizado\"}");
        }

        // Sacamos todos los turnos del empleado
        List<Cuadrante> turnos = cuadranteRepo.findByEmpleado_IdEmpleado(idEmpleado);

        // Filtramos para quedarnos solo con los turnos de hoy en adelante, y cogemos el más cercano (min)
        LocalDate hoy = LocalDate.now();
        Optional<Cuadrante> proximoTurno = turnos.stream()
                .filter(t -> t.getFecha() != null && !t.getFecha().isBefore(hoy))
                .min(Comparator.comparing(Cuadrante::getFecha));

        // Si encontramos un turno futuro, lo devolvemos. Si no, devolvemos null (200 OK, sin contenido)
        if (proximoTurno.isPresent()) {
            return ResponseEntity.ok(proximoTurno.get());
        } else {
            return ResponseEntity.ok(null);
        }
    }
}