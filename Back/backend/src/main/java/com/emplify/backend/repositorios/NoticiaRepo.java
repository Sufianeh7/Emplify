package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoticiaRepo extends JpaRepository<Noticia, Integer> {
    // Buscamos las noticias de la empresa que estén visibles y ordenadas de más nuevas a más antiguas
    List<Noticia> findByEmpresa_IdEmpresaAndVisibleTrueOrderByFechaCreacionDesc(Integer idEmpresa);
}