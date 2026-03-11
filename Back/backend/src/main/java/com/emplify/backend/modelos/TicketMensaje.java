package com.emplify.backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa cada mensaje individual dentro del chat de un Ticket de soporte.
 */
@Entity
@Table(name = "ticket_mensaje")
public class TicketMensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensaje")
    private Integer idMensaje;

    @Column(name = "contenido", columnDefinition = "TEXT", nullable = false)
    private String contenido;

    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio;

    // LAZY: Al leer un mensaje, no necesita cargar todos los datos de quien lo escribió
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_autor", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manager", "empresa", "usuario"})
    private Empleado autor;

    // LAZY: Evitamos cargar el ticket pesado.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ticket", nullable = false)
    @JsonIgnore
    private Ticket ticket;

    // Constructor vacío
    public TicketMensaje() {}

    // --- GETTERS Y SETTERS ---
    public Integer getIdMensaje() { return idMensaje; }
    public void setIdMensaje(Integer idMensaje) { this.idMensaje = idMensaje; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }

    public Empleado getAutor() { return autor; }
    public void setAutor(Empleado autor) { this.autor = autor; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }
}