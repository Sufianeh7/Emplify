package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio para gestionar las operaciones de base de datos de Empresa.
 */
@Repository
public interface EmpresaRepo extends JpaRepository<Empresa, Integer> {

    // Busca una empresa por su nombre exacto
    Optional<Empresa> findByNombre(String nombre);
}