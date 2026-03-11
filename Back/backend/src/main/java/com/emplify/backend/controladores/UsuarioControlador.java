package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Usuario;
import com.emplify.backend.repositorios.UsuarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador REST para la gestión de Usuarios.
 */

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:8100")
public class UsuarioControlador {

    @Autowired
    private UsuarioRepo usuarioRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Obtiene todos los usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> getAll() {
        return ResponseEntity.ok(usuarioRepo.findAll());
    }

    // Crea un usuario nuevo validando datos y encriptando la contraseña
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {
        if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"El email es obligatorio\"}");
        }

        if (usuarioRepo.existsByEmail(usuario.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("{\"error\": \"El email ya está en uso\"}");
        }

        try {
            // Encripta la contraseña antes de guardar en base de datos
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

            // Se crea activo por defecto
            if (usuario.getActivo() == null) {
                usuario.setActivo(true);
            }

            Usuario nuevoUsuario = usuarioRepo.save(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error interno al crear el usuario\"}");
        }
    }

    // Actualiza la contraseña del usuario logueado actualmente
    @PutMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> passwords, Principal principal) {
        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(principal.getName());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Usuario no encontrado\"}");
        }

        Usuario usuario = usuarioOpt.get();

        // 1. Verifica que la contraseña actual sea la correcta
        if (!passwordEncoder.matches(passwords.get("actual"), usuario.getPassword())) {
            return ResponseEntity.badRequest().body("{\"error\": \"La contraseña actual es incorrecta\"}");
        }

        // 2. Encripta la nueva y actualiza
        usuario.setPassword(passwordEncoder.encode(passwords.get("nueva")));
        usuarioRepo.save(usuario);

        return ResponseEntity.ok("{\"mensaje\": \"Contraseña actualizada con éxito\"}");
    }
}