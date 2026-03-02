package com.emplify.backend.modelos;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comentarios")
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comentario")
    private Integer idComentario;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenido;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    // Relación: Muchos comentarios pertenecen a UNA publicación
    @ManyToOne
    @JoinColumn(name = "id_publicacion", nullable = false)
    private VozEmpleado vozEmpleado;

    // Relación: Muchos comentarios son escritos por UN empleado
    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
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