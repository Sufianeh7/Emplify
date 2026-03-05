import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { businessOutline, personAddOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdminPage implements OnInit {

  // Controla qué pestaña estamos viendo
  seccionActual: string = 'empresas';

  empresas: any[] = [];

  // Modelos para los formularios
  nuevaEmpresa = {
    nombre: '',
    sector: '',
    direccion: '',
    colorPrimario: '#3880ff',
    colorSecundario: '#3dc2ff',
    logoUrl: ''
  };

  nuevoEmpleado = {
    nombre: '',
    email: '',
    password: '',
    rol: 'EMPLEADO', // Valor por defecto
    idEmpresa: null,
    departamento: '',
    puesto: ''
  };

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({ businessOutline, personAddOutline, saveOutline });
  }

  ngOnInit() {
    this.cargarEmpresas();
  }

  cargarEmpresas() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/admin/empresas', { headers })
      .subscribe({
        next: (res: any) => this.empresas = res,
        error: (err) => console.error('Error al cargar empresas', err)
      });
  }

  crearEmpresa() {
    if (!this.nuevaEmpresa.nombre) {
      this.mostrarToast('El nombre de la empresa es obligatorio', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token, 'Content-Type': 'application/json' });

    this.http.post('http://localhost:8080/api/admin/empresas', this.nuevaEmpresa, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast('Empresa creada con éxito', 'success');
          this.cargarEmpresas(); // Recargamos la lista
          this.nuevaEmpresa = { nombre: '', sector: '', direccion: '', colorPrimario: '#3880ff', colorSecundario: '#3dc2ff', logoUrl: '' }; // Limpiamos formulario
        },
        error: (err) => this.mostrarToast(err.error?.error || 'Error al crear empresa', 'danger')
      });
  }

  crearEmpleado() {
    if (!this.nuevoEmpleado.nombre || !this.nuevoEmpleado.email || !this.nuevoEmpleado.password || !this.nuevoEmpleado.idEmpresa) {
      this.mostrarToast('Rellena los campos obligatorios (Nombre, Email, Password, Empresa)', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token, 'Content-Type': 'application/json' });

    this.http.post('http://localhost:8080/api/admin/alta-empleado', this.nuevoEmpleado, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast('Empleado dado de alta correctamente', 'success');
          // Limpiamos el formulario
          this.nuevoEmpleado = { nombre: '', email: '', password: '', rol: 'EMPLEADO', idEmpresa: null, departamento: '', puesto: '' };
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
