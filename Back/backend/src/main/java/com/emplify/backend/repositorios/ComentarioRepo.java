package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepo extends JpaRepository<Comentario, Integer> {

    // Busca los comentarios de una publicación y los ordena cronológicamente
    List<Comentario> findByVozEmpleado_IdPublicacionOrderByFechaCreacionAsc(Integer idPublicacion);
}