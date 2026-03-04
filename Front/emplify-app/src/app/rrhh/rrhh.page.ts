import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { personAddOutline, saveOutline, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-rrhh',
  templateUrl: './rrhh.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RrhhPage implements OnInit {

  posiblesManagers: any[] = [];

  nuevoEmpleado = {
    nombre: '',
    email: '',
    password: '',
    rol: 'EMPLEADO', // Por defecto
    departamento: '',
    puesto: '',
    idManager: null // El ID del jefe que le asignemos
  };

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({ personAddOutline, saveOutline, peopleOutline });
  }

  ngOnInit() {
    this.cargarPosiblesManagers();
  }

  cargarPosiblesManagers() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/rrhh/posibles-managers', { headers })
      .subscribe({
        next: (res: any) => {
          // Guardamos la lista. Opcional: podrías filtrar aquí para que solo salgan los que tienen rol MANAGER
          this.posiblesManagers = res;
        },
        error: (err) => console.error('Error al cargar mánagers', err)
      });
  }

  crearEmpleado() {
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
          this.mostrarToast('Empleado dado de alta correctamente en la empresa', 'success');
          // Recargamos la lista por si a este nuevo empleado lo queremos poner de mánager de otro luego
          this.cargarPosiblesManagers();
          // Limpiamos el formulario
          this.nuevoEmpleado = { nombre: '', email: '', password: '', rol: 'EMPLEADO', departamento: '', puesto: '', idManager: null };
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
