package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Empresa;
import com.emplify.backend.modelos.Usuario;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.UsuarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/rrhh")
@CrossOrigin(origins = "http://localhost:8100")
public class RRHHControlador {

    @Autowired
    private EmpleadoRepo empleadoRepo;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==========================================
    // NUEVO: LISTAR TODOS LOS EMPLEADOS DE MI EMPRESA
    // ==========================================
    @GetMapping("/empleados")
    public ResponseEntity<?> obtenerEmpleadosDeMiEmpresa(Principal principal) {
        Optional<Empleado> rrhhOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (rrhhOpt.isPresent()) {
            Integer idEmpresa = rrhhOpt.get().getEmpresa().getIdEmpresa();
            // Traemos a todos los empleados de la misma empresa para el directorio
            List<Empleado> empleados = empleadoRepo.findByEmpresa_IdEmpresa(idEmpresa);
            return ResponseEntity.ok(empleados);
        }

        return ResponseEntity.status(401).body("{\"error\": \"No autorizado\"}");
    }

    // ==========================================
    // OBTENER MÁNAGERS DE MI EMPRESA
    // ==========================================
    @GetMapping("/posibles-managers")
    public ResponseEntity<?> obtenerManagersDeMiEmpresa(Principal principal) {
        Optional<Empleado> rrhhOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (rrhhOpt.isPresent()) {
            Integer idEmpresa = rrhhOpt.get().getEmpresa().getIdEmpresa();
            // Buscamos solo los que tengan rol MANAGER en esta empresa
            List<Empleado> managersEmpresa = empleadoRepo.findByEmpresa_IdEmpresaAndUsuario_Rol(idEmpresa, "MANAGER");
            return ResponseEntity.ok(managersEmpresa);
        }

        return ResponseEntity.status(401).body("{\"error\": \"No autorizado\"}");
    }

    // ==========================================
    // ALTA DE EMPLEADO (SOLO EN MI EMPRESA)
    // ==========================================
    @Transactional
    @PostMapping("/alta-empleado")
    public ResponseEntity<?> darDeAltaEmpleadoEnMiEmpresa(@RequestBody Map<String, Object> datos, Principal principal) {
        try {
            Optional<Empleado> rrhhOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
            if (rrhhOpt.isEmpty()) {
                return ResponseEntity.status(401).body("{\"error\": \"Usuario de RRHH no encontrado\"}");
            }
            Empresa miEmpresa = rrhhOpt.get().getEmpresa();

            // 1. Validar si el email ya existe
            if (usuarioRepo.findByEmail((String) datos.get("email")).isPresent()) {
                return ResponseEntity.badRequest().body("{\"error\": \"El email ya está registrado\"}");
            }

            // 2. Creamos el Usuario
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre((String) datos.get("nombre"));
            nuevoUsuario.setEmail((String) datos.get("email"));
            nuevoUsuario.setRol((String) datos.get("rol"));
            nuevoUsuario.setActivo(true);
            nuevoUsuario.setPassword(passwordEncoder.encode((String) datos.get("password")));

            usuarioRepo.save(nuevoUsuario);

            // 3. Creamos el Empleado
            Empleado nuevoEmpleado = new Empleado();
            nuevoEmpleado.setUsuario(nuevoUsuario);
            nuevoEmpleado.setEmpresa(miEmpresa);
            nuevoEmpleado.setDepartamento((String) datos.get("departamento"));
            nuevoEmpleado.setPuesto((String) datos.get("puesto"));
            nuevoEmpleado.setVacacionesDisponibles(22);
            nuevoEmpleado.setAsuntosPropiosDisponibles(6);

            // 4. Asignar Mánager si viene el ID
            if (datos.get("idManager") != null && !datos.get("idManager").toString().equals("null")) {
                Integer idManager = Integer.parseInt(datos.get("idManager").toString());
                empleadoRepo.findById(idManager).ifPresent(nuevoEmpleado::setManager);
            }

            empleadoRepo.save(nuevoEmpleado);

            return ResponseEntity.ok("{\"mensaje\": \"Empleado creado con éxito\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Error en el servidor\"}");
        }
    }
}