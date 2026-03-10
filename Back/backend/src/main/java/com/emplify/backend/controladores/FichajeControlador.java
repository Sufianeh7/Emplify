package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Fichaje;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.FichajeRepo;
import org.springframework.beans.factory.annotation.Autowired;
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

    // 1. OBTENER ESTADO DEL EMPLEADO HOY
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

    // 2. REGISTRAR ENTRADA
    @PostMapping("/entrada/{idEmpleado}")
    public ResponseEntity<?> registrarEntrada(@PathVariable Integer idEmpleado) {
        Optional<Empleado> empOpt = empleadoRepo.findById(idEmpleado);
        if (empOpt.isEmpty()) return ResponseEntity.badRequest().body("{\"error\": \"Empleado no encontrado\"}");

        // Comprobamos que no esté trabajando ya
        if (fichajeRepo.findFirstByEmpleado_IdEmpleadoAndHoraSalidaIsNullOrderByHoraEntradaDesc(idEmpleado).isPresent()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Ya tienes un turno abierto\"}");
        }

        Fichaje nuevo = new Fichaje();
        nuevo.setEmpleado(empOpt.get());
        nuevo.setHoraEntrada(LocalDateTime.now());

        fichajeRepo.save(nuevo);
        return ResponseEntity.ok("{\"mensaje\": \"Entrada registrada correctamente\"}");
    }

    // 3. REGISTRAR SALIDA
    @PutMapping("/salida/{idEmpleado}")
    public ResponseEntity<?> registrarSalida(@PathVariable Integer idEmpleado) {
        Optional<Fichaje> fichajeAbierto = fichajeRepo.findFirstByEmpleado_IdEmpleadoAndHoraSalidaIsNullOrderByHoraEntradaDesc(idEmpleado);

        if (fichajeAbierto.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"No tienes ninguna entrada registrada para salir\"}");
        }

        Fichaje actualizar = fichajeAbierto.get();
        actualizar.setHoraSalida(LocalDateTime.now());
        fichajeRepo.save(actualizar);

        return ResponseEntity.ok("{\"mensaje\": \"Salida registrada correctamente\"}");
    }

    // 4. OBTENER FICHAJES DE UN EMPLEADO (Histórico)
    @GetMapping("/historial/{idEmpleado}")
    public ResponseEntity<?> obtenerHistorialFichajes(@PathVariable Integer idEmpleado) {
        // En una app real, aquí filtraríamos por mes. Por ahora, devolvemos todos los de ese empleado.
        // Asegúrate de que este método exista en tu FichajeRepo (o crealo: List<Fichaje> findByEmpleado_IdEmpleado(Integer idEmpleado); )
        List<Fichaje> historial = fichajeRepo.findByEmpleado_IdEmpleado(idEmpleado);
        return ResponseEntity.ok(historial);
    }
}