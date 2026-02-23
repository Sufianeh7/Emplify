package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepo extends JpaRepository<Usuario, Integer>{
    // Hereda métodos como findAll() y save() de JpaRepository
}
