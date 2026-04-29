package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Cuadrante;
import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.repositorios.CuadranteRepo;
import com.emplify.backend.repositorios.EmpleadoRepo;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cuadrante")
public class CuadranteControlador {

    @Autowired
    private CuadranteRepo cuadranteRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // Obtiene el cuadrante completo validando la empresa
    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<?> obtenerCuadrantePorEmpleado(@PathVariable Integer idEmpleado, Principal principal) {
        Optional<Empleado> consultanteOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        Optional<Empleado> objetivoOpt = empleadoRepo.findById(idEmpleado);

        if (consultanteOpt.isPresent() && objetivoOpt.isPresent()) {
            if (!consultanteOpt.get().getEmpresa().getIdEmpresa().equals(objetivoOpt.get().getEmpresa().getIdEmpresa())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"error\": \"Acceso denegado al cuadrante de otra empresa\"}");
            }
            return ResponseEntity.ok(cuadranteRepo.findByEmpleado_IdEmpleado(idEmpleado));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Empleado no encontrado\"}");
    }

    // Asigna un solo turno
    @PostMapping("/asignar")
    public ResponseEntity<?> asignarTurno(@RequestBody Cuadrante nuevoTurno, Principal principal) {
        Optional<Empleado> autorOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        Optional<Empleado> receptorOpt = empleadoRepo.findById(nuevoTurno.getEmpleado().getIdEmpleado());

        if (autorOpt.isPresent() && receptorOpt.isPresent()) {
            if (autorOpt.get().getEmpresa().getIdEmpresa().equals(receptorOpt.get().getEmpresa().getIdEmpresa())) {
                return ResponseEntity.status(HttpStatus.CREATED).body(cuadranteRepo.save(nuevoTurno));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"error\": \"Asignación cross-company bloqueada\"}");
        }

        return ResponseEntity.badRequest().body("{\"error\": \"Datos no válidos\"}");
    }

    // Obtiene empleados de la misma empresa para el desplegable de asignación por parte de RRHH o Mánager
    @GetMapping("/mis-empleados")
    public ResponseEntity<?> obtenerMisEmpleados(Principal principal) {
        Optional<Empleado> rrhhOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (rrhhOpt.isPresent()) {
            Integer idEmpresa = rrhhOpt.get().getEmpresa().getIdEmpresa();
            return ResponseEntity.ok(empleadoRepo.findByEmpresa_IdEmpresa(idEmpresa));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"No autorizado\"}");
    }

    // Asignación masiva de turnos
    @Transactional
    @PostMapping("/asignar-masivo")
    public ResponseEntity<?> asignarTurnosMasivo(@RequestBody List<Cuadrante> nuevosTurnos, Principal principal) {
        Optional<Empleado> autorOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        if (autorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"No autorizado\"}");
        }

        Integer idEmpresaAutor = autorOpt.get().getEmpresa().getIdEmpresa();
        List<Cuadrante> turnosAprobados = new ArrayList<>();

        for (Cuadrante turno : nuevosTurnos) {
            Optional<Empleado> receptorOpt = empleadoRepo.findById(turno.getEmpleado().getIdEmpleado());

            if (receptorOpt.isEmpty() || !receptorOpt.get().getEmpresa().getIdEmpresa().equals(idEmpresaAutor)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"error\": \"Empleado receptor no válido\"}");
            }

            Optional<Cuadrante> turnoExistente = cuadranteRepo.findByEmpleado_IdEmpleadoAndFecha(
                    receptorOpt.get().getIdEmpleado(),
                    turno.getFecha()
            );

            if (turnoExistente.isPresent()) {
                Cuadrante actualizar = turnoExistente.get();
                actualizar.setTurno(turno.getTurno());
                // Si el frontend envía horas (para mañanas/tardes), las actualizamos también
                actualizar.setHoraInicio(turno.getHoraInicio());
                actualizar.setHoraFin(turno.getHoraFin());
                turnosAprobados.add(actualizar);
            } else {
                turno.setEmpleado(receptorOpt.get());
                turnosAprobados.add(turno);
            }
        }

        cuadranteRepo.saveAll(turnosAprobados);
        return ResponseEntity.ok("{\"mensaje\": \"Turnos procesados correctamente\"}");
    }

    // Obtener el próximo turno (Optimizado para consumir menos RAM)
    @GetMapping("/proximo/{idEmpleado}")
    public ResponseEntity<?> obtenerProximoTurno(@PathVariable Integer idEmpleado, Principal principal) {
        Optional<Empleado> consultanteOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
        if (consultanteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"No autorizado\"}");
        }

        // Delega el filtrado y ordenación directamente a la Base de Datos
        LocalDate hoy = LocalDate.now();
        Optional<Cuadrante> proximoTurno = cuadranteRepo.findFirstByEmpleado_IdEmpleadoAndFechaGreaterThanEqualOrderByFechaAsc(idEmpleado, hoy);

        if (proximoTurno.isPresent()) {
            return ResponseEntity.ok(proximoTurno.get());
        } else {
            return ResponseEntity.noContent().build();
        }
    }
}