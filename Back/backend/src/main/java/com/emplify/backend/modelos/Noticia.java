package com.emplify.backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa las noticias publicadas por RRHH para el carrusel de inicio.
 */
@Entity
@Table(name = "noticia")
public class Noticia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_noticia")
    private Integer idNoticia;

    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "subtitulo", length = 200)
    private String subtitulo;

    @Column(name = "contenido", columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "tipo_fondo", length = 50)
    private String tipoFondo; // Ej: "blue-bg" o "image-bg"

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "visible", nullable = false)
    private Boolean visible = true;

    // LAZY: Evita cargar los datos completos de la empresa por cada noticia en el carrusel
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Empresa empresa;

    public Noticia() {}

    // --- GETTERS Y SETTERS ---
    public Integer getIdNoticia() { return idNoticia; }
    public void setIdNoticia(Integer idNoticia) { this.idNoticia = idNoticia; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getSubtitulo() { return subtitulo; }
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

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