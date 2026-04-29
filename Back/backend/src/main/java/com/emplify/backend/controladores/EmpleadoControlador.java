package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.repositorios.EmpleadoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoControlador {

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // Obtiene todos los empleados
    @GetMapping("/todos")
    public ResponseEntity<List<Empleado>> obtenerTodos() {
        return ResponseEntity.ok(empleadoRepo.findAll());
    }

    // Endpoint principal de carga inicial en la app
    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerMisDatos(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"Usuario no autenticado\"}");
        }

        Optional<Empleado> empleadoOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (empleadoOpt.isPresent()) {
            return ResponseEntity.ok(empleadoOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Perfil de empleado no encontrado\"}");
        }
    }

    // Crea un empleado
    @PostMapping
    public ResponseEntity<Empleado> crearEmpleado(@RequestBody Empleado empleado){
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(empleadoRepo.save(empleado));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtiene un empleado por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        Optional<Empleado> empleadoOpt = empleadoRepo.findById(id);

        if (empleadoOpt.isPresent()) {
            return ResponseEntity.ok(empleadoOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Empleado no encontrado\"}");
        }
    }

    // Obtiene los empleados asignados al mánager actualmente logueado
    @GetMapping("/mi-equipo")
    public ResponseEntity<?> obtenerMiEquipo(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"Usuario no autenticado\"}");
        }

        Optional<Empleado> managerOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (managerOpt.isPresent()) {
            Integer idManager = managerOpt.get().getIdEmpleado();
            List<Empleado> equipo = empleadoRepo.findByManager_IdEmpleado(idManager);
            return ResponseEntity.ok(equipo);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Perfil de Mánager no encontrado\"}");
    }
}