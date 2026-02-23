package com.emplify.backend.controladores;

import com.emplify.backend.modelos.Empleado;
import com.emplify.backend.repositorios.EmpleadoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")

public class EmpleadoControlador {
    @Autowired
    private EmpleadoRepo empleadoRepo;

    // GET: Obtener todos los empleados
    @GetMapping
    public List<Empleado> getAll(){
        return empleadoRepo.findAll();
    }

    // POST: Crear un nuevo empleado
    @PostMapping
    public Empleado crearEmpleado(@RequestBody Empleado empleado){
        return empleadoRepo.save(empleado);
    }
}
