package com.emplify.backend.modelos;

import jakarta.persistence.*;

@Entity
@Table(name = "empleado")
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEmpleado;

    @OneToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario; // Relación 1:1 con Usuario

    @ManyToOne
    @JoinColumn(name = "id_empresa")
    private Empresa empresa; // Relación N:1 con Empresa

    // Un empleado puede tener un mánager (que también es un empleado)
    @ManyToOne
    @JoinColumn(name = "id_manager")
    private Empleado manager;

    private String departamento;
    private String puesto;

    public Empleado() {}

    // Getters y Setters
    public Integer getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Integer idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getPuesto() {
        return puesto;
    }

    public void setPuesto(String puesto) {
        this.puesto = puesto;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}