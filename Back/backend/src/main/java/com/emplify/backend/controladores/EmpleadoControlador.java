package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.repositorios.EmpleadoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = "http://localhost:8100")
public class EmpleadoControlador {

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // 1. Obtener la lista de TODOS los empleados (Para RRHH)
    @GetMapping("/todos")
    public ResponseEntity<List<Empleado>> obtenerTodos() {
        return ResponseEntity.ok(empleadoRepo.findAll());
    }

    // 2. ACTUALIZADO: Endpoint para el perfil (Coincide con Ionic)
    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerMisDatos(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("{\"error\": \"No autorizado\"}");
        }

        // Buscamos al empleado filtrando por el email del usuario autenticado
        return empleadoRepo.findByUsuarioEmail(principal.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(null));
    }

    // 3. POST: Crear un nuevo empleado
    @PostMapping
    public ResponseEntity<Empleado> crearEmpleado(@RequestBody Empleado empleado){
        return ResponseEntity.ok(empleadoRepo.save(empleado));
    }

    // 4. OPCIONAL: Obtener un empleado por ID (Útil para edición)
    @GetMapping("/{id}")
    public ResponseEntity<Empleado> obtenerPorId(@PathVariable Integer id) {
        return empleadoRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}