package com.emplify.backend.modelos;

import jakarta.persistence.*;

@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Integer idEmpresa;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "sector")
    private String sector;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "color_primario")
    private String colorPrimario;

    @Column(name = "color_secundario")
    private String colorSecundario;

    // Constructor vacío (Obligatorio para Spring/JPA)
    public Empresa() {
    }

    // Constructor con parámetros (Sin el ID, porque se genera automáticamente)
    public Empresa(String nombre, String logoUrl, String colorPrimario, String colorSecundario) {
        this.nombre = nombre;
        this.logoUrl = logoUrl;
        this.colorPrimario = colorPrimario;
        this.colorSecundario = colorSecundario;
    }

    // --- GETTERS Y SETTERS ---

    public Integer getIdEmpresa() {
        return idEmpresa;
    }

    public void setIdEmpresa(Integer idEmpresa) {
        this.idEmpresa = idEmpresa;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getColorPrimario() {
        return colorPrimario;
    }

    public void setColorPrimario(String colorPrimario) {
        this.colorPrimario = colorPrimario;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getColorSecundario() {
        return colorSecundario;
    }

    public void setColorSecundario(String colorSecundario) {
        this.colorSecundario = colorSecundario;
    }
}