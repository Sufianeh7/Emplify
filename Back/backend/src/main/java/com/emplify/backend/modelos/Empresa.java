package com.emplify.backend.modelos;

import jakarta.persistence.*;

/**
 * Entidad que representa a las empresas registradas
 */
@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Integer idEmpresa;

    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "sector", length = 100)
    private String sector;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "color_primario", length = 10)
    private String colorPrimario;

    @Column(name = "color_secundario", length = 10)
    private String colorSecundario;

    // Constructor vacío (Obligatorio para JPA)
    public Empresa() {
    }

    // Constructor con parámetros
    public Empresa(String nombre, String logoUrl, String colorPrimario, String colorSecundario) {
        this.nombre = nombre;
        this.logoUrl = logoUrl;
        this.colorPrimario = colorPrimario;
        this.colorSecundario = colorSecundario;
    }

    // --- GETTERS Y SETTERS ---

    public Integer getIdEmpresa() { return idEmpresa; }
    public void setIdEmpresa(Integer idEmpresa) { this.idEmpresa = idEmpresa; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getColorPrimario() { return colorPrimario; }
    public void setColorPrimario(String colorPrimario) { this.colorPrimario = colorPrimario; }

    public String getColorSecundario() { return colorSecundario; }
    public void setColorSecundario(String colorSecundario) { this.colorSecundario = colorSecundario; }
}