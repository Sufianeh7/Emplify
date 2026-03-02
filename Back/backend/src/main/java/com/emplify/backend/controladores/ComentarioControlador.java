package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Comentario;
import com.emplify.backend.repositorios.ComentarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/comentarios")
public class ComentarioControlador {

    @Autowired
    private ComentarioRepo comentarioRepo;

    // Obtener los comentarios de una publicación en concreto
    @GetMapping("/publicacion/{idPublicacion}")
    public ResponseEntity<List<Comentario>> obtenerComentarios(@PathVariable Integer idPublicacion) {
        return ResponseEntity.ok(comentarioRepo.findByVozEmpleado_IdPublicacionOrderByFechaCreacionAsc(idPublicacion));
    }

    // Guardar un nuevo comentario
    @PostMapping("/nuevo")
    public ResponseEntity<Comentario> crearComentario(@RequestBody Comentario nuevoComentario) {
        // Le asignamos la hora y fecha exacta en la que se crea
        nuevoComentario.setFechaCreacion(LocalDateTime.now());
        Comentario guardado = comentarioRepo.save(nuevoComentario);
        return ResponseEntity.ok(guardado);
    }
}