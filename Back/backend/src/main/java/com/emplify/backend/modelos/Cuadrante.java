package com.emplify.backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entidad que representa la asignación de un turno de trabajo a un empleado en una fecha concreta.
 */
@Entity
@Table(name = "cuadrante")
public class Cuadrante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuadrante")
    private Integer idCuadrante;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "turno", nullable = false, length = 50)
    private String turno; // Ej: "MAÑANA", "TARDE", "LIBRE"

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fin")
    private LocalTime horaFin;

    // LAZY: Al buscar un cuadrante no cargamos al empleado automáticamente.
    // JsonIgnoreProperties: Evita que Jackson devuelva basura de Hibernate o cree un bucle infinito.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manager", "empresa", "usuario"})
    private Empleado empleado;

    public Cuadrante() {}

    // --- GETTERS Y SETTERS ---

    public Integer getIdCuadrante() { return idCuadrante; }
    public void setIdCuadrante(Integer idCuadrante) { this.idCuadrante = idCuadrante; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getTurno() { return turno; }
    public void setTurno(String turno) { this.turno = turno; }

    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }

    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }

    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }
}