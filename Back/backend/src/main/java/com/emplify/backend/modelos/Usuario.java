package com.emplify.backend.modelos;

import jakarta.persistence.*;

/**
 * Entidad que representa las credenciales y el acceso al sistema de una persona.
 */
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    // Longitud 255 para asegurar que caben los hashes de BCrypt
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "rol", nullable = false, length = 20)
    private String rol;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true; // Por defecto, un usuario nace activo

    // Constructor vacío (Obligatorio para JPA)
    public Usuario() {}

    // Constructor con parámetros
    public Usuario(String nombre, String email, String password, String rol, Boolean activo) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.activo = activo;
    }

    // --- GETTERS Y SETTERS ---

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}