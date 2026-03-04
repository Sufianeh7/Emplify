package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.modelos.Empresa;
import com.emplify.backend.modelos.Usuario;
import com.emplify.backend.repositorios.EmpleadoRepo;
import com.emplify.backend.repositorios.EmpresaRepo;
import com.emplify.backend.repositorios.UsuarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // <-- AÑADIDO
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:8100")
public class AdminControlador {

    @Autowired
    private EmpresaRepo empresaRepo;

    @Autowired
    private EmpleadoRepo empleadoRepo;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @Autowired
    private PasswordEncoder passwordEncoder; // <-- INYECTADO AQUÍ

    // ==========================================
    // GESTIÓN DE EMPRESAS
    // ==========================================

    @PostMapping("/empresas")
    public ResponseEntity<?> crearEmpresa(@RequestBody Empresa empresa) {
        try {
            Empresa nuevaEmpresa = empresaRepo.save(empresa);
            return ResponseEntity.ok(nuevaEmpresa);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Error al crear la empresa. ¿Quizás el nombre ya existe?\"}");
        }
    }

    @GetMapping("/empresas")
    public ResponseEntity<List<Empresa>> obtenerEmpresas() {
        return ResponseEntity.ok(empresaRepo.findAll());
    }

    // ==========================================
    // GESTIÓN DE USUARIOS/EMPLEADOS
    // ==========================================

    @Transactional // Usamos transaccional porque guardamos en dos tablas distintas
    @PostMapping("/alta-empleado")
    public ResponseEntity<?> darDeAltaEmpleado(@RequestBody Map<String, Object> datos) {
        try {
            // 1. Extraemos y validamos la Empresa
            Integer idEmpresa = Integer.parseInt(datos.get("idEmpresa").toString());
            Optional<Empresa> empresaOpt = empresaRepo.findById(idEmpresa);
            if (empresaOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"La empresa especificada no existe\"}");
            }

            // 2. Creamos el Usuario (Credenciales)
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre((String) datos.get("nombre"));
            nuevoUsuario.setEmail((String) datos.get("email"));
            nuevoUsuario.setRol((String) datos.get("rol")); // Ej: "EMPLEADO", "RRHH"
            nuevoUsuario.setActivo(true);

            // ---> ENCRIPTACIÓN DE CONTRASEÑA APLICADA AQUÍ <---
            String rawPassword = (String) datos.get("password");
            nuevoUsuario.setPassword(passwordEncoder.encode(rawPassword));

            usuarioRepo.save(nuevoUsuario);

            // 3. Creamos el Empleado y lo vinculamos al Usuario y a la Empresa
            Empleado nuevoEmpleado = new Empleado();
            nuevoEmpleado.setUsuario(nuevoUsuario);
            nuevoEmpleado.setEmpresa(empresaOpt.get());
            nuevoEmpleado.setDepartamento((String) datos.get("departamento"));
            nuevoEmpleado.setPuesto((String) datos.get("puesto"));

            // Valores por defecto (ya los tienes en tu modelo, pero los forzamos por si acaso)
            nuevoEmpleado.setVacacionesDisponibles(22);
            nuevoEmpleado.setAsuntosPropiosDisponibles(6);

            // 4. (Opcional) Asignar Mánager si viene en la petición
            if (datos.get("idManager") != null) {
                Integer idManager = Integer.parseInt(datos.get("idManager").toString());
                empleadoRepo.findById(idManager).ifPresent(nuevoEmpleado::setManager);
            }

            empleadoRepo.save(nuevoEmpleado);

            return ResponseEntity.ok("{\"mensaje\": \"Empleado creado y asignado a la empresa correctamente\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Error al dar de alta al empleado\"}");
        }
    }
}