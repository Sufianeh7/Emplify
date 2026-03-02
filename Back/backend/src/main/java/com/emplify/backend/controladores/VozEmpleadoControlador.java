package com.emplify.backend.controladores;

import com.emplify.backend.modelos.VozEmpleado;
import com.emplify.backend.repositorios.VozEmpleadoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/voz-empleado")
public class VozEmpleadoControlador {

    @Autowired
    private VozEmpleadoRepo vozEmpleadoRepo;

    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<VozEmpleado>> obtenerMuro(@PathVariable Integer idEmpresa) {
        return ResponseEntity.ok(vozEmpleadoRepo.findByEmpresa_IdEmpresaAndVisibleTrueOrderByFechaCreacionDesc(idEmpresa));
    }

    @PostMapping("/publicar")
    public ResponseEntity<VozEmpleado> publicar(@RequestBody VozEmpleado nuevaPublicacion) {
        nuevaPublicacion.setFechaCreacion(LocalDateTime.now());
        nuevaPublicacion.setVisible(true);
        return ResponseEntity.ok(vozEmpleadoRepo.save(nuevaPublicacion));
    }
}