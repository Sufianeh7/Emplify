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
            Empleado emp = empleadoOpt.get();

            // Construimos un DTO (Data Transfer Object) con un Map
            java.util.Map<String, Object> perfilDto = new java.util.HashMap<>();

            perfilDto.put("idEmpleado", emp.getIdEmpleado());
            perfilDto.put("nombreUsuario", emp.getNombreUsuario()); // Tu getter especial
            perfilDto.put("puesto", emp.getPuesto());
            perfilDto.put("departamento", emp.getDepartamento());
            perfilDto.put("vacacionesDisponibles", emp.getVacacionesDisponibles());
            perfilDto.put("asuntosPropiosDisponibles", emp.getAsuntosPropiosDisponibles());

            // Datos del Usuario (Email)
            if (emp.getUsuario() != null) {
                java.util.Map<String, Object> usuarioDto = new java.util.HashMap<>();
                usuarioDto.put("email", emp.getUsuario().getEmail());
                perfilDto.put("usuario", usuarioDto);
                usuarioDto.put("rol", emp.getUsuario().getRol());
            }

            // Datos de la Empresa
            if (emp.getEmpresa() != null) {
                java.util.Map<String, Object> empresaDto = new java.util.HashMap<>();
                empresaDto.put("nombre", emp.getEmpresa().getNombre());
                empresaDto.put("direccion", emp.getEmpresa().getDireccion());
                empresaDto.put("id_empresa", emp.getEmpresa().getIdEmpresa());
                perfilDto.put("empresa", empresaDto);
            }

            // Datos del Mánager
            if (emp.getManager() != null) {
                java.util.Map<String, Object> managerDto = new java.util.HashMap<>();
                managerDto.put("idEmpleado", emp.getManager().getIdEmpleado());
                managerDto.put("nombreUsuario", emp.getManager().getNombreUsuario());
                managerDto.put("puesto", emp.getManager().getPuesto());
                perfilDto.put("manager", managerDto);
            } else {
                perfilDto.put("manager", null);
            }

            return ResponseEntity.ok(perfilDto);
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