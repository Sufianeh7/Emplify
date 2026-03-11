package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoticiaRepo extends JpaRepository<Noticia, Integer> {

    // Obtiene las noticias activas de una empresa, ordenadas de más reciente a más antigua
    List<Noticia> findByEmpresa_IdEmpresaAndVisibleTrueOrderByFechaCreacionDesc(Integer idEmpresa);
}