package com.emplify.backend.modelos;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio; // El día que empiezan las vacaciones

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin; // El día que terminan

    @Column(name = "estado", nullable = false)
    private String estado; // Ej: "PENDIENTE", "APROBADA", "RECHAZADA"

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud; // Cuándo le dio al botón de pedir

    // Relación: Muchas solicitudes pertenecen a un Empleado
    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    // Relación: Una solicitud pertenece a un Tipo específico (Vacaciones, Asuntos propios...)
    @ManyToOne
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoSolicitud tipoSolicitud;

    // Constructor vacío
    public Solicitud() {
    }

    // --- GETTERS Y SETTERS ---
    public Integer getIdSolicitud() { return idSolicitud; }
    public void setIdSolicitud(Integer idSolicitud) { this.idSolicitud = idSolicitud; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }

    public TipoSolicitud getTipoSolicitud() { return tipoSolicitud; }

    public void setTipoSolicitud(TipoSolicitud tipoSolicitud) { this.tipoSolicitud = tipoSolicitud; }
}