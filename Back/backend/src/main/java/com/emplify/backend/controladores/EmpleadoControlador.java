package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.repositorios.EmpleadoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List; // <-- Añadimos este import
import java.util.Optional;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = "http://localhost:8100") // <-- ¡Vital para que Ionic no dé error de CORS!
public class EmpleadoControlador {

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // NUEVO: Obtener la lista de TODOS los empleados (Para RRHH)
    @GetMapping("/todos")
    public ResponseEntity<List<Empleado>> obtenerTodos() {
        return ResponseEntity.ok(empleadoRepo.findAll());
    }

    // Obtener SOLO los datos del empleado que ha iniciado sesión
    @GetMapping("/yo")
    public ResponseEntity<?> obtenerMisDatos(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("No autorizado");
        }

        // Buscamos al empleado filtrando por el email del usuario autenticado
        Optional<Empleado> empleado = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (empleado.isPresent()) {
            return ResponseEntity.ok(empleado.get());
        } else {
            return ResponseEntity.status(404).body("Empleado no encontrado");
        }
    }

    // POST: Crear un nuevo empleado
    @PostMapping
    public Empleado crearEmpleado(@RequestBody Empleado empleado){
        return empleadoRepo.save(empleado);
    }
}