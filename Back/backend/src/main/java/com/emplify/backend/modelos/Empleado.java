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
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_empresa")
    private Empresa empresa;

    @ManyToOne
    @JoinColumn(name = "id_manager")
    private Empleado manager;

    private String departamento;
    private String puesto;

    // --- NUEVOS CAMPOS PARA CONTROL DE DÍAS ---
    @Column(name = "vacaciones_disponibles")
    private Integer vacacionesDisponibles = 22;

    @Column(name = "asuntos_propios_disponibles")
    private Integer asuntosPropiosDisponibles = 6;
    // ------------------------------------------

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

    public Empleado getManager() {
        return manager;
    }

    public void setManager(Empleado manager) {
        this.manager = manager;
    }

    public Integer getVacacionesDisponibles() {
        return vacacionesDisponibles;
    }

    public void setVacacionesDisponibles(Integer vacacionesDisponibles) {
        this.vacacionesDisponibles = vacacionesDisponibles;
    }

    public Integer getAsuntosPropiosDisponibles() {
        return asuntosPropiosDisponibles;
    }

    public void setAsuntosPropiosDisponibles(Integer asuntosPropiosDisponibles) {
        this.asuntosPropiosDisponibles = asuntosPropiosDisponibles;
    }
}