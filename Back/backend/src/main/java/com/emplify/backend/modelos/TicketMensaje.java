package com.emplify.backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_mensajes")
public class TicketMensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMensaje;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenido;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    // El empleado que escribe el mensaje (puede ser el solicitante o alguien de RRHH)
    @ManyToOne
    @JoinColumn(name = "id_autor")
    private Empleado autor;

    // Relación con el ticket al que pertenece la conversación
    @ManyToOne
    @JoinColumn(name = "id_ticket")
    @JsonIgnore // Evita que al cargar el mensaje se intente cargar el ticket de nuevo (bucle infinito)
    private Ticket ticket;

    // Constructor por defecto necesario para JPA
    public TicketMensaje() {
        this.fechaEnvio = LocalDateTime.now();
    }

    // Getters y Setters
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