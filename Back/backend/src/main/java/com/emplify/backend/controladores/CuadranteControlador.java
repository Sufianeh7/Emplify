package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Cuadrante;
import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.repositorios.CuadranteRepo;
import com.emplify.backend.repositorios.EmpleadoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
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

        // Buscamos al que hace la consulta
        Optional<Empleado> consultanteOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        // Buscamos al empleado del que queremos ver el cuadrante
        Optional<Empleado> objetivoOpt = empleadoRepo.findById(idEmpleado);

        if (consultanteOpt.isPresent() && objetivoOpt.isPresent()) {
            Empleado consultante = consultanteOpt.get();
            Empleado objetivo = objetivoOpt.get();

            // VALIDACIÓN: ¿Pertenecen a la misma empresa?
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
        // El empleado al que se le asigna el turno viene dentro del objeto Cuadrante
        Optional<Empleado> receptorOpt = empleadoRepo.findById(nuevoTurno.getEmpleado().getIdEmpleado());

        if (autorOpt.isPresent() && receptorOpt.isPresent()) {
            Empleado autor = autorOpt.get();
            Empleado receptor = receptorOpt.get();

            // BLOQUEO: Solo si son de la misma empresa
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
            // Usamos la query que ya tenemos en el repo para filtrar por empresa
            List<Empleado> misEmpleados = empleadoRepo.findByEmpresa_IdEmpresa(idEmpresa);
            return ResponseEntity.ok(misEmpleados);
        }

        return ResponseEntity.status(401).body("{\"error\": \"No autorizado\"}");
    }
}