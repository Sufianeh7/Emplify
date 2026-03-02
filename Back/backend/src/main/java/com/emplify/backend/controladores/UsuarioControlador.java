package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Usuario;
import com.emplify.backend.repositorios.UsuarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioControlador {

    @Autowired
    private UsuarioRepo usuarioRepo;

    // Inyectamos el encriptador para el cambio de contraseña
    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- TUS MÉTODOS ORIGINALES ---

    // GET: Obtener todos los usuarios (Útil para el panel de Admin)
    @GetMapping
    public List<Usuario> getAll(){
        return usuarioRepo.findAll();
    }

    // POST: Crear un nuevo usuario
    @PostMapping
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        // Nota: Si creas usuarios por aquí, deberías encriptar la contraseña antes de guardar.
        // usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepo.save(usuario);
    }

    // --- NUEVO MÉTODO PARA EL PERFIL DEL EMPLEADO ---

    // PUT: Actualizar solo la contraseña del usuario logueado
    @PutMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> passwords, Principal principal) {
        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(principal.getName());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(404).body("{\"error\": \"Usuario no encontrado\"}");
        }

        Usuario usuario = usuarioOpt.get();

        // 1. Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(passwords.get("actual"), usuario.getPassword())) {
            return ResponseEntity.status(400).body("{\"error\": \"La contraseña actual es incorrecta\"}");
        }

        // 2. Encriptar la nueva y guardarla
        usuario.setPassword(passwordEncoder.encode(passwords.get("nueva")));
        usuarioRepo.save(usuario);

        return ResponseEntity.ok("{\"mensaje\": \"Contraseña actualizada con éxito\"}");
    }
}