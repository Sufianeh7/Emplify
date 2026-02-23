package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empresa;
import com.emplify.backend.repositorios.EmpresaRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresa")
public class EmpresaControlador {

    @Autowired
    private EmpresaRepo empresaRepo;

    // GET: Obtener todas las empresas
    @GetMapping
    public List<Empresa> obtenerTodas() {
        return empresaRepo.findAll();
    }

    // POST: Crear una empresa nueva
    @PostMapping
    public Empresa crearEmpresa(@RequestBody Empresa empresa) {
        return empresaRepo.save(empresa);
    }
}