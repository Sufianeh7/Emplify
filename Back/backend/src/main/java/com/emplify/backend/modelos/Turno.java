package com.emplify.backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "turnos")
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTurno;

    @Column(nullable = false)
    private LocalDate fecha;

    // Ej: "MAÑANA", "TARDE", "NOCHE", "LIBRE"
    @Column(nullable = false)
    private String tipo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empleado", nullable = false)
    @JsonIgnoreProperties({"turnos", "tickets", "password"})
    private Empleado empleado;

    public Turno() {}

    public Turno(LocalDate fecha, String tipo, Empleado empleado) {
        this.fecha = fecha;
        this.tipo = tipo;
        this.empleado = empleado;
    }

    // Getters y Setters
    public Integer getIdTurno() { return idTurno; }
    public void setIdTurno(Integer idTurno) { this.idTurno = idTurno; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }
}