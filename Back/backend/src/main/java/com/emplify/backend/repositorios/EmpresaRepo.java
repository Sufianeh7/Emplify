package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpresaRepo extends JpaRepository<Empresa, Integer> {
    // Si en un futuro necesitas buscar por nombre, puedes añadir:
    // Optional<Empresa> findByNombre(String nombre);
}