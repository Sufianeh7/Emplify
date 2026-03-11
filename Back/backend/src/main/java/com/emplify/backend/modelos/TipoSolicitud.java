package com.emplify.backend.modelos;

import jakarta.persistence.*;

/**
 * Entidad que define los motivos por los que un empleado puede solicitar una ausencia.
 */
@Entity
@Table(name = "tipo_solicitud")
public class TipoSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo")
    private Integer idTipo;

    // El nombre es obligatorio y único
    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre; // Ej: "VACACIONES", "ASUNTOS_PROPIOS", "BAJA_MEDICA"

    // Los días base por defecto
    @Column(name = "dias_anuales")
    private Integer diasAnuales;

    public TipoSolicitud() {}

    // Constructor
    public TipoSolicitud(String nombre, Integer diasAnuales) {
        this.nombre = nombre;
        this.diasAnuales = diasAnuales;
    }

    // --- GETTERS Y SETTERS ---
    public Integer getIdTipo() { return idTipo; }
    public void setIdTipo(Integer idTipo) { this.idTipo = idTipo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getDiasAnuales() { return diasAnuales; }
    public void setDiasAnuales(Integer diasAnuales) { this.diasAnuales = diasAnuales; }
}