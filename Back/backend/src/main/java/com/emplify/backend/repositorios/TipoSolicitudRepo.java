package com.emplify.backend.repositorios;

import com.emplify.backend.modelos.TipoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TipoSolicitudRepo extends JpaRepository<TipoSolicitud, Integer> {}