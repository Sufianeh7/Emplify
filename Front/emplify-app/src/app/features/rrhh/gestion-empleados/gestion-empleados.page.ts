import { GestionEquipoPage } from './../gestion-equipo/gestion-equipo.page';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import {
  personAddOutline, saveOutline, peopleOutline,
  searchOutline, closeOutline, businessOutline, mailOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-empleados', // Actualizado al nuevo nombre
  templateUrl: './gestion-empleados.page.html', // Actualizado
  styleUrls: ['./gestion-empleados.page.scss'], // Añadimos estilos
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class GestionEmpleadosPage implements OnInit {

  // Listado de empleados
  empleados: any[] = [];
  empleadosFiltrados: any[] = [];
  textoBusqueda: string = '';

  posiblesManagers: any[] = [];

  // Objeto para el modal de creación
  nuevoEmpleado = {
    nombre: '',
    email: '',
    password: '',
    rol: 'EMPLEADO',
    departamento: '',
    puesto: '',
    idManager: null
  };

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({
      personAddOutline, saveOutline, peopleOutline,
      searchOutline, closeOutline, businessOutline, mailOutline
    });
  }

  ngOnInit() {
    this.cargarEmpleados();
    this.cargarPosiblesManagers();
  }

  // Obtiene la primera letra del nombre para el Avatar
  getInicial(nombre: string): string {
    if (!nombre) return '?'; // Si no hay nombre, devolvemos una interrogación
    return nombre.charAt(0).toUpperCase();
  }

  // --- 1. CARGAR EL DIRECTORIO ---
  cargarEmpleados() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    // ATENCIÓN: Necesitarás este endpoint en tu backend si no lo tienes
    this.http.get('http://localhost:8080/api/rrhh/empleados', { headers })
      .subscribe({
        next: (res: any) => {
          this.empleados = res;
          this.empleadosFiltrados = [...this.empleados];
        },
        error: (err) => console.error('Error al cargar empleados', err)
      });
  }

  buscarEmpleado(event: any) {
    const texto = event.target.value.toLowerCase();
    this.textoBusqueda = texto;
    if (!texto) {
      this.empleadosFiltrados = [...this.empleados];
      return;
    }
    this.empleadosFiltrados = this.empleados.filter(emp =>
      (emp.usuario?.nombre && emp.usuario.nombre.toLowerCase().includes(texto)) ||
      (emp.usuario?.email && emp.usuario.email.toLowerCase().includes(texto)) ||
      (emp.departamento && emp.departamento.toLowerCase().includes(texto))
    );
  }

  // --- 2. CARGAR MANAGERS ---
  cargarPosiblesManagers() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/rrhh/posibles-managers', { headers })
      .subscribe({
        next: (res: any) => this.posiblesManagers = res,
        error: (err) => console.error('Error al cargar mánagers', err)
      });
  }

  // --- 3. CREAR EMPLEADO (Tu lógica) ---
  crearEmpleado(modal: any) {
    if (!this.nuevoEmpleado.nombre || !this.nuevoEmpleado.email || !this.nuevoEmpleado.password) {
      this.mostrarToast('Nombre, Email y Contraseña son obligatorios', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:8080/api/rrhh/alta-empleado', this.nuevoEmpleado, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast('Empleado dado de alta correctamente', 'success');
          this.cargarEmpleados(); // Recargamos la lista visual
          this.cargarPosiblesManagers(); // Actualizamos managers

          // Limpiamos y cerramos
          this.nuevoEmpleado = { nombre: '', email: '', password: '', rol: 'EMPLEADO', departamento: '', puesto: '', idManager: null };
          modal.dismiss();
        },
        error: (err) => this.mostrarToast(err.error?.error || 'Error al crear empleado', 'danger')
      });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
