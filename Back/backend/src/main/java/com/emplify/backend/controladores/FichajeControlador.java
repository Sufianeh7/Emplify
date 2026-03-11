package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Fichaje;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.FichajeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/fichajes")
@CrossOrigin(origins = "http://localhost:8100")
public class FichajeControlador {

    @Autowired
    private FichajeRepo fichajeRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // Obtiene el estado actual (Fichaje de hoy y si está trabajando en este instante)
    @GetMapping("/estado/{idEmpleado}")
    public ResponseEntity<?> obtenerEstadoHoy(@PathVariable Integer idEmpleado) {
        LocalDateTime inicioDia = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime finDia = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        List<Fichaje> fichajesHoy = fichajeRepo.findByEmpleado_IdEmpleadoAndHoraEntradaBetweenOrderByHoraEntradaAsc(
                idEmpleado, inicioDia, finDia);

        Optional<Fichaje> fichajeAbierto = fichajeRepo.findFirstByEmpleado_IdEmpleadoAndHoraSalidaIsNullOrderByHoraEntradaDesc(idEmpleado);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("fichajes", fichajesHoy);
        respuesta.put("trabajando", fichajeAbierto.isPresent());

        if (fichajeAbierto.isPresent()) {
            respuesta.put("horaEntradaActual", fichajeAbierto.get().getHoraEntrada());
        }

        return ResponseEntity.ok(respuesta);
    }

    // Ficha la entrada
    @PostMapping("/entrada/{idEmpleado}")
    public ResponseEntity<?> registrarEntrada(@PathVariable Integer idEmpleado) {
        Optional<Empleado> empOpt = empleadoRepo.findById(idEmpleado);

        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Empleado no encontrado\"}");
        }

        if (fichajeRepo.findFirstByEmpleado_IdEmpleadoAndHoraSalidaIsNullOrderByHoraEntradaDesc(idEmpleado).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("{\"error\": \"Ya tienes un turno abierto sin finalizar\"}");
        }

        Fichaje nuevo = new Fichaje();
        nuevo.setEmpleado(empOpt.get());
        nuevo.setHoraEntrada(LocalDateTime.now());

        fichajeRepo.save(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body("{\"mensaje\": \"Entrada registrada correctamente\"}");
    }

    // Ficha la salida
    @PutMapping("/salida/{idEmpleado}")
    public ResponseEntity<?> registrarSalida(@PathVariable Integer idEmpleado) {
        Optional<Fichaje> fichajeAbierto = fichajeRepo.findFirstByEmpleado_IdEmpleadoAndHoraSalidaIsNullOrderByHoraEntradaDesc(idEmpleado);

        if (fichajeAbierto.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"error\": \"No tienes ninguna entrada registrada para salir\"}");
        }

        Fichaje actualizar = fichajeAbierto.get();
        actualizar.setHoraSalida(LocalDateTime.now());
        fichajeRepo.save(actualizar);

        return ResponseEntity.ok("{\"mensaje\": \"Salida registrada correctamente\"}");
    }

    // Obtiene el historial completo del empleado
    @GetMapping("/historial/{idEmpleado}")
    public ResponseEntity<List<Fichaje>> obtenerHistorialFichajes(@PathVariable Integer idEmpleado) {
        List<Fichaje> historial = fichajeRepo.findByEmpleado_IdEmpleadoOrderByHoraEntradaDesc(idEmpleado);
        return ResponseEntity.ok(historial);
    }
}