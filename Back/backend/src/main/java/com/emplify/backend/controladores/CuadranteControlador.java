package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Cuadrante;
import com.emplify.backend.repositorios.CuadranteRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuadrante")
public class CuadranteControlador {

    @Autowired
    private CuadranteRepo cuadranteRepo;

    // Este método escucha peticiones GET en la ruta /api/cuadrante/empleado/{id}
    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<List<Cuadrante>> obtenerCuadrantePorEmpleado(@PathVariable Integer idEmpleado) {

        // Llamamos al repositorio
        List<Cuadrante> turnos = cuadranteRepo.findByEmpleado_IdEmpleado(idEmpleado);

        // Si no tiene turnos, devolverá una lista vacía [], y si tiene, devolverá los datos.
        return ResponseEntity.ok(turnos);
    }
}