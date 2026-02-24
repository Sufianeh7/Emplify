package com.emplify.backend.modelos;

import jakarta.persistence.*;

@Entity
@Table(name = "tipo_solicitud")
public class TipoSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo")
    private Integer idTipo;

    @Column(name = "nombre", nullable = false)
    private String nombre; // Ej: "VACACIONES", "ASUNTOS_PROPIOS", "BAJA_MEDICA"

    @Column(name = "dias_anuales")
    private Integer diasAnuales; // Los días base por defecto

    public TipoSolicitud() {
    }

    // --- GETTERS Y SETTERS ---
    public Integer getIdTipo() { return idTipo; }
    public void setIdTipo(Integer idTipo) { this.idTipo = idTipo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getDiasAnuales() { return diasAnuales; }
    public void setDiasAnuales(Integer diasAnuales) { this.diasAnuales = diasAnuales; }
}