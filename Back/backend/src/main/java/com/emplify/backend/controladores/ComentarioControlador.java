package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Comentario;
import com.emplify.backend.repositorios.ComentarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/comentarios")
@CrossOrigin(origins = "http://localhost:8100")
public class ComentarioControlador {

    @Autowired
    private ComentarioRepo comentarioRepo;

    // Obtiene los comentarios de una publicación en concreto
    @GetMapping("/publicacion/{idPublicacion}")
    public ResponseEntity<List<Comentario>> obtenerComentarios(@PathVariable Integer idPublicacion) {
        return ResponseEntity.ok(comentarioRepo.findByVozEmpleado_IdPublicacionOrderByFechaCreacionAsc(idPublicacion));
    }

    // Guarda un nuevo comentario
    @PostMapping("/nuevo")
    public ResponseEntity<?> crearComentario(@RequestBody Comentario nuevoComentario) {

        // 1. Validaciones de seguridad e integridad
        if (nuevoComentario.getContenido() == null || nuevoComentario.getContenido().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"El comentario no puede estar vacío\"}");
        }
        if (nuevoComentario.getVozEmpleado() == null || nuevoComentario.getVozEmpleado().getIdPublicacion() == null) {
            return ResponseEntity.badRequest().body("{\"error\": \"El comentario debe pertenecer a una publicación\"}");
        }
        if (nuevoComentario.getEmpleado() == null || nuevoComentario.getEmpleado().getIdEmpleado() == null) {
            return ResponseEntity.badRequest().body("{\"error\": \"El comentario debe tener un autor asociado\"}");
        }

        // 2. Autocompleta datos del servidor (evita que el usuario mande fechas falsas)
        nuevoComentario.setFechaCreacion(LocalDateTime.now());

        try {
            Comentario guardado = comentarioRepo.save(nuevoComentario);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error interno al guardar el comentario\"}");
        }
    }
}