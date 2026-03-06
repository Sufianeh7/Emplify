package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Noticia;
import com.emplify.backend.repositorios.NoticiaRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaControlador {

    @Autowired
    private NoticiaRepo noticiaRepo;

    // Obtener las noticias del carrusel para el inicio
    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<Noticia>> obtenerNoticias(@PathVariable Integer idEmpresa) {
        return ResponseEntity.ok(noticiaRepo.findByEmpresa_IdEmpresaAndVisibleTrueOrderByFechaCreacionDesc(idEmpresa));
    }

    // Crear una nueva noticia
    @PostMapping("/publicar")
    public ResponseEntity<Noticia> publicarNoticia(@RequestBody Noticia noticia) {
        noticia.setFechaCreacion(LocalDateTime.now());
        noticia.setVisible(true);
        return ResponseEntity.ok(noticiaRepo.save(noticia));
    }
}