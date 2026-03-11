package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmpleadoRepo extends JpaRepository<Empleado, Integer> {

    // Busca al empleado cruzando con la tabla Usuario por email
    Optional<Empleado> findByUsuarioEmail(String email);

    // Busca al empleado cruzando con la tabla Usuario por nombre
    Optional<Empleado> findByUsuarioNombre(String nombre);

    // Busca a todos los empleados que reportan a un mánager concreto
    List<Empleado> findByManager_IdEmpleado(Integer idManager);

    // Busca a todos los trabajadores de una empresa específica
    List<Empleado> findByEmpresa_IdEmpresa(Integer idEmpresa);

    // Busca empleados filtrando por empresa y rol
    List<Empleado> findByEmpresa_IdEmpresaAndUsuario_Rol(Integer idEmpresa, String rol);
}