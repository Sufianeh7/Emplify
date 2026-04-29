package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empresa;
import com.emplify.backend.repositorios.EmpresaRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión individual de Empresas.
 */
@RestController
@RequestMapping("/api/empresa")
public class EmpresaControlador {

    @Autowired
    private EmpresaRepo empresaRepo;

    // Devuelve la lista completa de empresas registradas
    @GetMapping
    public ResponseEntity<List<Empresa>> obtenerTodas() {
        List<Empresa> empresas = empresaRepo.findAll();
        return ResponseEntity.ok(empresas);
    }

    // Crea una nueva empresa validando que el nombre no exista ya
    @PostMapping
    public ResponseEntity<?> crearEmpresa(@RequestBody Empresa empresa) {
        // Validamos si ya existe una empresa con ese nombre
        if (empresa.getNombre() == null || empresa.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"El nombre de la empresa es obligatorio\"}");
        }

        if (empresaRepo.findByNombre(empresa.getNombre()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("{\"error\": \"Ya existe una empresa con ese nombre\"}");
        }

        try {
            Empresa nuevaEmpresa = empresaRepo.save(empresa);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa); // 201 Created
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error interno al crear la empresa\"}");
        }
    }
}