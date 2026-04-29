package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Empresa;
import com.emplify.backend.modelos.Usuario;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.EmpresaRepo;
import com.emplify.backend.repositorios.UsuarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminControlador {

    @Autowired
    private EmpresaRepo empresaRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==========================================
    // GESTIÓN DE EMPRESAS
    // ==========================================
    @PostMapping("/empresas")
    public ResponseEntity<?> crearEmpresa(@RequestBody Empresa empresa) {
        if (empresa.getNombre() == null || empresa.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"El nombre de la empresa es obligatorio\"}");
        }

        if (empresaRepo.findByNombre(empresa.getNombre()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("{\"error\": \"Ya existe una empresa con ese nombre\"}");
        }

        try {
            Empresa nuevaEmpresa = empresaRepo.save(empresa);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error interno al crear la empresa\"}");
        }
    }

    @GetMapping("/empresas")
    public ResponseEntity<List<Empresa>> obtenerEmpresas() {
        return ResponseEntity.ok(empresaRepo.findAll());
    }

    // ==========================================
    // GESTIÓN DE USUARIOS/EMPLEADOS
    // ==========================================
    @Transactional // Asegura que si falla el Empleado, el Usuario tampoco se guarde
    @PostMapping("/alta-empleado")
    public ResponseEntity<?> darDeAltaEmpleado(@RequestBody Map<String, Object> datos) {
        try {
            // Validaciones previas de seguridad
            if (!datos.containsKey("idEmpresa") || !datos.containsKey("email") || !datos.containsKey("password")) {
                return ResponseEntity.badRequest().body("{\"error\": \"Faltan datos obligatorios (Empresa, Email o Password)\"}");
            }

            String email = datos.get("email").toString();
            if (usuarioRepo.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("{\"error\": \"El email ya está registrado en el sistema\"}");
            }

            Integer idEmpresa = Integer.parseInt(datos.get("idEmpresa").toString());
            Optional<Empresa> empresaOpt = empresaRepo.findById(idEmpresa);

            if (empresaOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"La empresa especificada no existe\"}");
            }

            // Crea el usuario (Credenciales)
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre((String) datos.getOrDefault("nombre", ""));
            nuevoUsuario.setEmail(email);
            nuevoUsuario.setRol((String) datos.getOrDefault("rol", "EMPLEADO"));
            nuevoUsuario.setActivo(true);

            // Encripta la contraseña de forma segura
            String rawPassword = (String) datos.get("password");
            nuevoUsuario.setPassword(passwordEncoder.encode(rawPassword));

            usuarioRepo.save(nuevoUsuario);

            // Crea el empleado y lo vincula a una empresa
            Empleado nuevoEmpleado = new Empleado();
            nuevoEmpleado.setUsuario(nuevoUsuario);
            nuevoEmpleado.setEmpresa(empresaOpt.get());
            nuevoEmpleado.setDepartamento((String) datos.getOrDefault("departamento", ""));
            nuevoEmpleado.setPuesto((String) datos.getOrDefault("puesto", ""));

            // Días base por defecto
            nuevoEmpleado.setVacacionesDisponibles(22);
            nuevoEmpleado.setAsuntosPropiosDisponibles(6);

            // Asigna un mánager si viene en la petición
            if (datos.containsKey("idManager") && datos.get("idManager") != null) {
                try {
                    Integer idManager = Integer.parseInt(datos.get("idManager").toString());
                    empleadoRepo.findById(idManager).ifPresent(nuevoEmpleado::setManager);
                } catch (NumberFormatException ignored) {
                    // Si mandan un ID inválido, lo ignoramos y se queda sin mánager
                }
            }

            empleadoRepo.save(nuevoEmpleado);

            return ResponseEntity.status(HttpStatus.CREATED).body("{\"mensaje\": \"Empleado creado y asignado a la empresa correctamente\"}");

        } catch (Exception e) {
            // Quitamos el e.printStackTrace() para no ensuciar logs de producción
            return ResponseEntity.internalServerError().body("{\"error\": \"Error grave al dar de alta al empleado\"}");
        }
    }

    // ==========================================
    // LISTADOS Y DASHBOARD
    // ==========================================
    @GetMapping("/empleados")
    public ResponseEntity<List<Empleado>> obtenerTodosLosEmpleados() {
        return ResponseEntity.ok(empleadoRepo.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            Map<String, Object> stats = Map.of(
                    "totalEmpresas", empresaRepo.count(),
                    "totalEmpleados", empleadoRepo.count()
            );

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error al calcular estadísticas\"}");
        }
    }
}