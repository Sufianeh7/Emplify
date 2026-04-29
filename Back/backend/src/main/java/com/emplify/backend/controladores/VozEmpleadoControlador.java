package com.emplify.backend.controladores;

import com.emplify.backend.modelos.VozEmpleado;
import com.emplify.backend.repositorios.VozEmpleadoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/voz-empleado")
public class VozEmpleadoControlador {

    @Autowired
    private VozEmpleadoRepo vozEmpleadoRepo;

    // Obtiene el muro de la empresa
    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<VozEmpleado>> obtenerMuro(@PathVariable Integer idEmpresa) {
        return ResponseEntity.ok(vozEmpleadoRepo.findByEmpresa_IdEmpresaAndVisibleTrueOrderByFechaCreacionDesc(idEmpresa));
    }

    // Crea una nueva publicación en el muro
    @PostMapping("/publicar")
    public ResponseEntity<?> publicar(@RequestBody VozEmpleado nuevaPublicacion) {

        // 1. Validaciones básicas de seguridad
        if (nuevaPublicacion.getTitulo() == null || nuevaPublicacion.getTitulo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"El título es obligatorio\"}");
        }
        if (nuevaPublicacion.getContenido() == null || nuevaPublicacion.getContenido().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"El contenido no puede estar vacío\"}");
        }
        if (nuevaPublicacion.getEmpresa() == null || nuevaPublicacion.getEmpresa().getIdEmpresa() == null) {
            return ResponseEntity.badRequest().body("{\"error\": \"Debe asociarse a una empresa válida\"}");
        }

        // 2. Autocompleta datos del servidor (para que el frontend no pueda falsificar la fecha)
        nuevaPublicacion.setFechaCreacion(LocalDateTime.now());
        nuevaPublicacion.setVisible(true);

        try {
            VozEmpleado guardada = vozEmpleadoRepo.save(nuevaPublicacion);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error al guardar la publicación\"}");
        }
    }
}