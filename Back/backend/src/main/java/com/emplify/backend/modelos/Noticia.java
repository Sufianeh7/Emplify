package com.emplify.backend.modelos;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "noticias")
public class Noticia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idNoticia;

    private String titulo;
    private String subtitulo;

    // Puede ser "blue-bg" (fondo azul corporativo) o "image-bg" (imagen de fondo)
    private String tipoFondo;

    // Si tipoFondo es "image-bg", aquí guardamos el enlace de la foto
    private String imagenUrl;

    private LocalDateTime fechaCreacion;
    private Boolean visible = true;

    // Relación con la Empresa (igual que en VozEmpleado)
    @ManyToOne
    @JoinColumn(name = "id_empresa")
    private Empresa empresa;

    // --- GETTERS Y SETTERS ---
    // (Genera aquí los getters y setters o usa @Data si tienes Lombok)

    public Integer getIdNoticia() { return idNoticia; }
    public void setIdNoticia(Integer idNoticia) { this.idNoticia = idNoticia; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getSubtitulo() { return subtitulo; }
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }
    public String getTipoFondo() { return tipoFondo; }
    public void setTipoFondo(String tipoFondo) { this.tipoFondo = tipoFondo; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public Boolean getVisible() { return visible; }
    public void setVisible(Boolean visible) { this.visible = visible; }
    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }
}