import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  businessOutline, personAddOutline, saveOutline, statsChartOutline,
  peopleOutline, pieChartOutline, addCircleOutline, listOutline,
  briefcaseOutline
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class AdminPage implements OnInit {

  seccionActual: string = 'dashboard'; // Por defecto abrimos el dashboard

  // --- DATOS ---
  estadisticas: any = { totalEmpresas: 0, totalEmpleados: 0 };
  empresas: any[] = [];
  empleados: any[] = [];

  // --- FORMULARIOS ---
  nuevaEmpresa = {
    nombre: '', sector: '', direccion: '', colorPrimario: '#0071ad', colorSecundario: '#3dc2ff', logoUrl: ''
  };

  nuevoEmpleado: any = {
    nombre: '', email: '', password: '', rol: 'EMPLEADO', idEmpresa: null, idManager: null, departamento: '', puesto: ''
  };

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({
      businessOutline, personAddOutline, saveOutline, statsChartOutline,
      peopleOutline, pieChartOutline, addCircleOutline, listOutline, briefcaseOutline
    });
  }

  ngOnInit() {
    this.cargarDatosGlobales();
  }

  // NUEVO: Filtra los empleados por empresa Y que tengan rol de MANAGER
  get posiblesManagers() {
    if (!this.nuevoEmpleado.idEmpresa) return [];

    return this.empleados.filter(e =>
      e.empresa?.idEmpresa === this.nuevoEmpleado.idEmpresa &&
      e.usuario?.rol === 'MANAGER' // <-- Condición para listar solo a los mánagers
    );
  }

  cargarDatosGlobales() {
    this.cargarEstadisticas();
    this.cargarEmpresas();
    this.cargarEmpleados();
  }

  // ==========================================
  // LLAMADAS GET
  // ==========================================
  cargarEstadisticas() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:8080/api/admin/stats', { headers }).subscribe({
      next: (res: any) => this.estadisticas = res,
      error: (err) => console.error('Error cargando estadísticas', err)
    });
  }

  cargarEmpresas() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:8080/api/admin/empresas', { headers }).subscribe({
      next: (res: any) => this.empresas = res,
      error: (err) => console.error('Error al cargar empresas', err)
    });
  }

  cargarEmpleados() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:8080/api/admin/empleados', { headers }).subscribe({
      next: (res: any) => this.empleados = res,
      error: (err) => console.error('Error al cargar empleados', err)
    });
  }

  // ==========================================
  // LLAMADAS POST (CREACIÓN)
  // ==========================================
  crearEmpresa() {
    if (!this.nuevaEmpresa.nombre) {
      this.mostrarToast('El nombre de la empresa es obligatorio', 'warning');
      return;
    }

    const headers = this.getHeaders();
    this.http.post('http://localhost:8080/api/admin/empresas', this.nuevaEmpresa, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Empresa creada con éxito', 'success');
        this.nuevaEmpresa = { nombre: '', sector: '', direccion: '', colorPrimario: '#0071ad', colorSecundario: '#3dc2ff', logoUrl: '' };
        this.cargarDatosGlobales(); // Refrescamos todo
      },
      error: (err) => this.mostrarToast(err.error?.error || 'Error al crear empresa', 'danger')
    });
  }

  crearEmpleado() {
    if (!this.nuevoEmpleado.nombre || !this.nuevoEmpleado.email || !this.nuevoEmpleado.password || !this.nuevoEmpleado.idEmpresa) {
      this.mostrarToast('Rellena Nombre, Email, Password y selecciona Empresa', 'warning');
      return;
    }

    const headers = this.getHeaders();
    this.http.post('http://localhost:8080/api/admin/alta-empleado', this.nuevoEmpleado, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Usuario dado de alta correctamente', 'success');
        // Limpiamos también el idManager tras crearlo
        this.nuevoEmpleado = { nombre: '', email: '', password: '', rol: 'EMPLEADO', idEmpresa: null, idManager: null, departamento: '', puesto: '' };
        this.cargarDatosGlobales(); // Refrescamos todo
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
      message: mensaje, duration: 3000, color: color, position: 'bottom'
    });
    toast.present();
  }
}
