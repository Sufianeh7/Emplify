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
    // OBTENER MÁNAGERS DE MI EMPRESA
    // ==========================================
    @GetMapping("/posibles-managers")
    public ResponseEntity<?> obtenerManagersDeMiEmpresa(Principal principal) {
        // 1. Buscamos al usuario de RRHH que hace la petición
        Optional<Empleado> rrhhOpt = empleadoRepo.findByUsuarioEmail(principal.getName());

        if (rrhhOpt.isPresent()) {
            Empresa miEmpresa = rrhhOpt.get().getEmpresa();

            // 2. BUSCAMOS SOLO LOS QUE SEAN MANAGER EN SU EMPRESA
            List<Empleado> managersEmpresa = empleadoRepo.findByEmpresa_IdEmpresaAndUsuario_Rol(miEmpresa.getIdEmpresa(), "MANAGER");

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
            // 1. Buscamos al RRHH y obtenemos SU empresa
            Optional<Empleado> rrhhOpt = empleadoRepo.findByUsuarioEmail(principal.getName());
            if (rrhhOpt.isEmpty()) {
                return ResponseEntity.status(401).body("{\"error\": \"Usuario de RRHH no encontrado\"}");
            }
            Empresa miEmpresa = rrhhOpt.get().getEmpresa();

            // 2. Creamos el Usuario (Credenciales)
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre((String) datos.get("nombre"));
            nuevoUsuario.setEmail((String) datos.get("email"));
            nuevoUsuario.setRol((String) datos.get("rol")); // EMPLEADO o MANAGER
            nuevoUsuario.setActivo(true);

            String rawPassword = (String) datos.get("password");
            nuevoUsuario.setPassword(passwordEncoder.encode(rawPassword));

            usuarioRepo.save(nuevoUsuario);

            // 3. Creamos el Empleado y le asignamos AUTOMÁTICAMENTE la empresa del RRHH
            Empleado nuevoEmpleado = new Empleado();
            nuevoEmpleado.setUsuario(nuevoUsuario);
            nuevoEmpleado.setEmpresa(miEmpresa); // <--- LA MAGIA ESTÁ AQUÍ
            nuevoEmpleado.setDepartamento((String) datos.get("departamento"));
            nuevoEmpleado.setPuesto((String) datos.get("puesto"));
            nuevoEmpleado.setVacacionesDisponibles(22);
            nuevoEmpleado.setAsuntosPropiosDisponibles(6);

            // 4. Asignar Mánager si viene en la petición
            if (datos.get("idManager") != null) {
                Integer idManager = Integer.parseInt(datos.get("idManager").toString());
                empleadoRepo.findById(idManager).ifPresent(nuevoEmpleado::setManager);
            }

            empleadoRepo.save(nuevoEmpleado);

            return ResponseEntity.ok("{\"mensaje\": \"Empleado creado en tu empresa con éxito\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Error al dar de alta al empleado\"}");
        }
    }
}