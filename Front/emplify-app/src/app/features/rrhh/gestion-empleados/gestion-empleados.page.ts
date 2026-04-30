import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import {
  personAddOutline,
  peopleOutline,
  searchOutline,
  closeOutline,
  businessOutline,
  mailOutline,
} from 'ionicons/icons';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-empleados',
  templateUrl: './gestion-empleados.page.html',
  styleUrls: ['./gestion-empleados.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent],
})
export class GestionEmpleadosPage {
  // Listados
  empleados: any[] = [];
  empleadosFiltrados: any[] = [];
  textoBusqueda: string = '';
  posiblesManagers: any[] = [];

  // Modelo del formulario de alta
  nuevoEmpleado = {
    nombre: '',
    email: '',
    password: '',
    rol: 'EMPLEADO',
    departamento: '',
    puesto: '',
    idManager: null,
  };

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
  ) {
    addIcons({
      personAddOutline,
      peopleOutline,
      searchOutline,
      closeOutline,
      businessOutline,
      mailOutline,
    });
  }

  // Aseguramos carga fresca de datos al entrar
  ionViewWillEnter() {
    this.cargarEmpleados();
    this.cargarPosiblesManagers();
  }

  // Utilidad visual: Extrae la primera letra para pintar el avatar circular
  getInicial(nombre: string): string {
    if (!nombre) return '?';
    return nombre.charAt(0).toUpperCase();
  }

  // --- 1. GESTIÓN DEL DIRECTORIO ---
  // Trae a todo el personal de la empresa
  cargarEmpleados() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    this.http
      .get(environment.apiUrl + '/rrhh/empleados', { headers })
      .subscribe({
        next: (res: any) => {
          this.empleados = res;
          this.empleadosFiltrados = [...this.empleados]; // Inicializamos la vista filtrada
        },
        error: (err) => console.error('Error al cargar empleados', err),
      });
  }

  // Filtrado en memoria (sin llamadas a BD) por Nombre, Email o Depto.
  buscarEmpleado(event: any) {
    const texto = (event.target.value || '').toLowerCase();
    this.textoBusqueda = texto;

    if (!texto) {
      this.empleadosFiltrados = [...this.empleados];
      return;
    }

    this.empleadosFiltrados = this.empleados.filter(
      (emp) =>
        (emp.usuario?.nombre &&
          emp.usuario.nombre.toLowerCase().includes(texto)) ||
        (emp.usuario?.email &&
          emp.usuario.email.toLowerCase().includes(texto)) ||
        (emp.departamento && emp.departamento.toLowerCase().includes(texto)),
    );
  }

  // --- 2. GESTIÓN DE MANAGERS ---
  // Trae solo a los usuarios que pueden ser asignados como jefes de equipo
  cargarPosiblesManagers() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    this.http
      .get(environment.apiUrl + '/rrhh/posibles-managers', { headers })
      .subscribe({
        next: (res: any) => (this.posiblesManagers = res),
        error: (err) => console.error('Error al cargar mánagers', err),
      });
  }

  // --- 3. ALTA DE NUEVO EMPLEADO ---
  crearEmpleado(modal: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token,
      'Content-Type': 'application/json',
    });

    this.http
      .post(environment.apiUrl + '/rrhh/alta-empleado', this.nuevoEmpleado, {
        headers,
      })
      .subscribe({
        next: () => {
          this.mostrarToast('Empleado dado de alta correctamente', 'success');

          // Refrescamos las listas para que el nuevo aparezca
          this.cargarEmpleados();
          this.cargarPosiblesManagers();

          // Reseteamos formulario y cerramos modal
          this.nuevoEmpleado = {
            nombre: '',
            email: '',
            password: '',
            rol: 'EMPLEADO',
            departamento: '',
            puesto: '',
            idManager: null,
          };
          modal.dismiss();
        },
        error: (err) => {
          const msg = err.error?.error || 'Error al crear empleado';
          this.mostrarToast(msg, 'danger');
        },
      });
  }

  // Notificaciones
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }
}
