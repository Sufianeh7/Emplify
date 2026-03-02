package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.repositorios.EmpleadoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoControlador {

    @Autowired
    private EmpleadoRepo empleadoRepo;

    // NUEVO: Obtener SOLO los datos del empleado que ha iniciado sesión
    @GetMapping("/yo")
    public ResponseEntity<?> obtenerMisDatos(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("No autorizado");
        }

        // Buscamos al empleado filtrando por el email del usuario autenticado
        // principal.getName() nos da el email (ej: luis@ok.com)
        Optional<Empleado> empleado = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (empleado.isPresent()) {
            return ResponseEntity.ok(empleado.get());
        } else {
            return ResponseEntity.status(404).body("Empleado no encontrado");
        }
    }

    // POST: Crear un nuevo empleado (se queda igual)
    @PostMapping
    public Empleado crearEmpleado(@RequestBody Empleado empleado){
        return empleadoRepo.save(empleado);
    }
}