package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Usuario;
import com.emplify.backend.repositorios.UsuarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")

public class UsuarioControlador {
    @Autowired
    private UsuarioRepo usuarioRepo;

    // GET: Obtener todos los usuarios
    @GetMapping
    public List<Usuario> getAll(){
        return usuarioRepo.findAll();
    }

    // POST: Crear un nuevo usuario
    @PostMapping
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        return usuarioRepo.save(usuario);
    }
}
