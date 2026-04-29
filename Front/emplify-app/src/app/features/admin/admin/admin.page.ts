import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

// Solo importamos los iconos que usamos en esta pantalla
import {
  businessOutline, personAddOutline, saveOutline,
  peopleOutline, addCircleOutline, listOutline, briefcaseOutline,
  personCircleOutline
} from 'ionicons/icons';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class AdminPage {

  seccionActual: string = 'dashboard';

  // --- MODELOS DE DATOS ---
  estadisticas: any = { totalEmpresas: 0, totalEmpleados: 0 };
  empresas: any[] = [];
  empleados: any[] = [];

  // Modelos para formularios de creación
  nuevaEmpresa = {
    nombre: '', sector: '', direccion: '', colorPrimario: '#0071ad', colorSecundario: '#3dc2ff', logoUrl: ''
  };

  nuevoEmpleado: any = {
    nombre: '', email: '', password: '', rol: 'EMPLEADO', idEmpresa: null, idManager: null, departamento: '', puesto: ''
  };

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      businessOutline, personAddOutline, saveOutline,
      peopleOutline, addCircleOutline, listOutline, briefcaseOutline, personCircleOutline
    });
  }

  // Refresca la vista del SuperAdmin siempre que entra
  ionViewWillEnter() {
    this.cargarDatosGlobales();
  }

  // GETTER DINÁMICO: Filtra a los empleados para mostrar solo a los que son Mánagers
  // y que además pertenezcan a la empresa que acabamos de seleccionar en el formulario.
  get posiblesManagers() {
    if (!this.nuevoEmpleado.idEmpresa) return [];

    return this.empleados.filter(e =>
      e.empresa?.idEmpresa === this.nuevoEmpleado.idEmpresa &&
      e.usuario?.rol === 'MANAGER'
    );
  }

  // --- ORQUESTADOR DE CARGA ---
  cargarDatosGlobales() {
    this.cargarEstadisticas();
    this.cargarEmpresas();
    this.cargarEmpleados();
  }

  // --- LLAMADAS GET ---
  cargarEstadisticas() {
    const headers = this.getHeaders();
    this.http.get(environment.apiUrl+'/admin/stats', { headers }).subscribe({
      next: (res: any) => this.estadisticas = res,
      error: (err) => console.error('Error cargando estadísticas', err)
    });
  }

  cargarEmpresas() {
    const headers = this.getHeaders();
    this.http.get(environment.apiUrl+'/admin/empresas', { headers }).subscribe({
      next: (res: any) => this.empresas = res,
      error: (err) => console.error('Error al cargar empresas', err)
    });
  }

  cargarEmpleados() {
    const headers = this.getHeaders();
    this.http.get(environment.apiUrl+'/admin/empleados', { headers }).subscribe({
      next: (res: any) => this.empleados = res,
      error: (err) => console.error('Error al cargar listado global de usuarios', err)
    });
  }

  // --- LLAMADAS POST (CREACIÓN) ---
  crearEmpresa() {
    if (!this.nuevaEmpresa.nombre) return;

    const headers = this.getHeaders();
    this.http.post(environment.apiUrl+'/admin/empresas', this.nuevaEmpresa, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Empresa creada con éxito', 'success');
        this.nuevaEmpresa = { nombre: '', sector: '', direccion: '', colorPrimario: '#0071ad', colorSecundario: '#3dc2ff', logoUrl: '' };
        this.cargarDatosGlobales(); // Actualiza contadores y listas
      },
      error: (err) => this.mostrarToast(err.error?.error || 'Error al crear empresa', 'danger')
    });
  }

  crearEmpleado() {
    if (!this.nuevoEmpleado.nombre || !this.nuevoEmpleado.email || !this.nuevoEmpleado.password || !this.nuevoEmpleado.idEmpresa) {
      return;
    }

    const headers = this.getHeaders();
    this.http.post(environment.apiUrl+'/admin/alta-empleado', this.nuevoEmpleado, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Usuario dado de alta correctamente', 'success');
        this.nuevoEmpleado = { nombre: '', email: '', password: '', rol: 'EMPLEADO', idEmpresa: null, idManager: null, departamento: '', puesto: '' };
        this.cargarDatosGlobales(); // Actualiza contadores y listas
      },
      error: (err) => this.mostrarToast(err.error?.error || 'Error al crear usuario', 'danger')
    });
  }

  // --- UTILIDADES ---
  getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': 'Basic ' + token, 'Content-Type': 'application/json' });
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
