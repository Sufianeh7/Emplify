package com.emplify.backend.modelos;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cuadrante")
public class Cuadrante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuadrante")
    private Integer idCuadrante;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha; // Ej: 2026-03-01

    @Column(name = "turno", nullable = false)
    private String turno; // Ej: "MAÑANA", "TARDE", "NOCHE", "LIBRE", "VACACIONES"

    // La clave de todo: Muchos días de cuadrante pertenecen a un solo Empleado
    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    // Constructor vacío obligatorio para Spring Boot
    public Cuadrante() {
    }

    // --- GETTERS Y SETTERS ---
    public Integer getIdCuadrante() { return idCuadrante; }
    public void setIdCuadrante(Integer idCuadrante) { this.idCuadrante = idCuadrante; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getTurno() { return turno; }
    public void setTurno(String turno) { this.turno = turno; }

    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }
}