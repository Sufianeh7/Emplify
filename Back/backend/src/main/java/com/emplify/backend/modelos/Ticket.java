package com.emplify.backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que gestiona las incidencias o peticiones de soporte a RRHH.
 */
@Entity
@Table(name = "ticket")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    private Integer idTicket;

    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(name = "estado", nullable = false, length = 50)
    private String estado; // "PENDIENTE", "EN PROCESO", "RESUELTO"

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    // LAZY: Protege la carga del empleado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manager", "empresa", "usuario"})
    private Empleado empleado;

    // LAZY: Carga diferida de mensajes.
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("fechaEnvio ASC")
    @JsonIgnoreProperties("ticket")
    private List<TicketMensaje> mensajes;

    public Ticket() {}

    // --- GETTERS Y SETTERS ---
    public Integer getIdTicket() { return idTicket; }
    public void setIdTicket(Integer idTicket) { this.idTicket = idTicket; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }

    public List<TicketMensaje> getMensajes() { return mensajes; }
    public void setMensajes(List<TicketMensaje> mensajes) { this.mensajes = mensajes; }
}