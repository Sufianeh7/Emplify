package com.emplify.backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que registra las entradas y salidas de la jornada de un empleado.
 */
@Entity
@Table(name = "fichaje")
public class Fichaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_fichaje")
    private Integer idFichaje;

    // LAZY: Crítico aquí, ya que habrá miles de fichajes y no queremos cargar al empleado cada vez
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manager", "empresa", "usuario"})
    private Empleado empleado;

    @Column(name = "hora_entrada", nullable = false)
    private LocalDateTime horaEntrada;

    // Puede ser nulo porque cuando el empleado entra a trabajar, aún no ha salido
    @Column(name = "hora_salida")
    private LocalDateTime horaSalida;

    public Fichaje() {}

    // --- GETTERS Y SETTERS ---
    public Integer getIdFichaje() { return idFichaje; }
    public void setIdFichaje(Integer idFichaje) { this.idFichaje = idFichaje; }

    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }

    public LocalDateTime getHoraEntrada() { return horaEntrada; }
    public void setHoraEntrada(LocalDateTime horaEntrada) { this.horaEntrada = horaEntrada; }

    public LocalDateTime getHoraSalida() { return horaSalida; }
    public void setHoraSalida(LocalDateTime horaSalida) { this.horaSalida = horaSalida; }
}