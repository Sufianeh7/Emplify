package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.VozEmpleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VozEmpleadoRepo extends JpaRepository<VozEmpleado, Integer> {
    // Busca publicaciones de la empresa y que sean visibles, ordenadas por fecha reciente
    List<VozEmpleado> findByEmpresa_IdEmpresaAndVisibleTrueOrderByFechaCreacionDesc(Integer idEmpresa);
}