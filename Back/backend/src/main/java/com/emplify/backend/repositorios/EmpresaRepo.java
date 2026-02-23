package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpresaRepo extends JpaRepository<Empresa, Integer> {
    // Hereda métodos como findAll() y save() de JpaRepository
}