package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Noticia;
import com.emplify.backend.repositorios.NoticiaRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/noticias")
@CrossOrigin(origins = "http://localhost:8100")
public class NoticiaControlador {

    @Autowired
    private NoticiaRepo noticiaRepo;

    // Obtiene las noticias del carrusel de una empresa
    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<Noticia>> obtenerNoticias(@PathVariable Integer idEmpresa) {
        List<Noticia> noticias = noticiaRepo.findByEmpresa_IdEmpresaAndVisibleTrueOrderByFechaCreacionDesc(idEmpresa);
        return ResponseEntity.ok(noticias);
    }

    // Crea una nueva noticia con validaciones básicas
    @PostMapping("/publicar")
    public ResponseEntity<?> publicarNoticia(@RequestBody Noticia noticia) {

        // 1. Validaciones
        if (noticia.getTitulo() == null || noticia.getTitulo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"El título de la noticia es obligatorio\"}");
        }
        if (noticia.getEmpresa() == null || noticia.getEmpresa().getIdEmpresa() == null) {
            return ResponseEntity.badRequest().body("{\"error\": \"La noticia debe pertenecer a una empresa válida\"}");
        }

        // 2. Autocompleta datos de seguridad
        noticia.setFechaCreacion(LocalDateTime.now());
        noticia.setVisible(true);

        try {
            Noticia guardada = noticiaRepo.save(noticia);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error al publicar la noticia\"}");
        }
    }
}