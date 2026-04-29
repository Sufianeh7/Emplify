package com.emplify.backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/**
 * Entidad Empleado. Relaciona al Usuario con la Empresa y define su posición en esta.
 */
@Entity
@Table(name = "empleado")
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Integer idEmpleado;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empresa", nullable = false)
    private Empresa empresa;

    // LAZY: No carga toda la jerarquía de mánagers de golpe para ahorrar memoria.
    // JsonIgnoreProperties evita que Jackson se rompa al intentar convertir un proxy Lazy a JSON.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_manager")
    @JsonIgnore
    private Empleado manager;

    @Column(name = "departamento", length = 100)
    private String departamento;

    @Column(name = "puesto", length = 100)
    private String puesto;

    @Column(name = "vacaciones_disponibles", nullable = false)
    private Integer vacacionesDisponibles = 22;

    @Column(name = "asuntos_propios_disponibles", nullable = false)
    private Integer asuntosPropiosDisponibles = 6;

    public Empleado() {}

    // --- GETTERS Y SETTERS ---

    public Integer getIdEmpleado() { return idEmpleado; }
    public void setIdEmpleado(Integer idEmpleado) { this.idEmpleado = idEmpleado; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public Empleado getManager() { return manager; }
    public void setManager(Empleado manager) { this.manager = manager; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public String getPuesto() { return puesto; }
    public void setPuesto(String puesto) { this.puesto = puesto; }

    public Integer getVacacionesDisponibles() { return vacacionesDisponibles; }
    public void setVacacionesDisponibles(Integer vacacionesDisponibles) { this.vacacionesDisponibles = vacacionesDisponibles; }

    public Integer getAsuntosPropiosDisponibles() { return asuntosPropiosDisponibles; }
    public void setAsuntosPropiosDisponibles(Integer asuntosPropiosDisponibles) { this.asuntosPropiosDisponibles = asuntosPropiosDisponibles; }

    // Jackson lee esto y crea automáticamente la propiedad "nombreUsuario" en el JSON
    public String getNombreUsuario() {
        if (this.usuario != null && this.usuario.getNombre() != null) {
            return this.usuario.getNombre();
        }
        return "Desconocido";
    }

}