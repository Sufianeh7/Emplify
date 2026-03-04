package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmpleadoRepo extends JpaRepository<Empleado, Integer> {
    // Busca dentro de la relación Usuario el campo email y nombre
    Optional<Empleado> findByUsuarioEmail(String email);

    Optional<Empleado> findByUsuarioNombre(String nombre);

    // NUEVO: Busca a todos los empleados que están a cargo de un mánager concreto
    List<Empleado> findByManager_IdEmpleado(Integer idManager);

    // Busca a todos los empleados que pertenecen a una empresa específica
    List<Empleado> findByEmpresa_IdEmpresa(Integer idEmpresa);

    // NUEVA: Busca empleados por su empresa y por el rol que tienen en la tabla Usuario
    List<Empleado> findByEmpresa_IdEmpresaAndUsuario_Rol(Integer idEmpresa, String rol);
}