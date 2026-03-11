package com.emplify.backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa las respuestas de los empleados a las publicaciones del muro.
 */
@Entity
@Table(name = "comentario")
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comentario")
    private Integer idComentario;

    @Column(name = "contenido", columnDefinition = "TEXT", nullable = false)
    private String contenido;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    // LAZY: Al cargar los comentarios, no carga el post entero una y otra vez
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_publicacion", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "empleado", "empresa", "contenido"})
    private VozEmpleado vozEmpleado;

    // LAZY: Solo necesita saber quién lo escribió, sin cargar todo su historial laboral
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manager", "empresa", "usuario"})
    private Empleado empleado;

    public Comentario() {}

    // --- GETTERS Y SETTERS ---
    public Integer getIdComentario() { return idComentario; }
    public void setIdComentario(Integer idComentario) { this.idComentario = idComentario; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public VozEmpleado getVozEmpleado() { return vozEmpleado; }
    public void setVozEmpleado(VozEmpleado vozEmpleado) { this.vozEmpleado = vozEmpleado; }

    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }
}