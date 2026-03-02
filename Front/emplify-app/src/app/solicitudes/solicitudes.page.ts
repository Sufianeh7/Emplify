import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular'; // Añadido ToastController
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { sendOutline, calendarOutline, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SolicitudesPage implements OnInit {

  tiposSolicitud: any[] = [];
  misSolicitudes: any[] = [];
  turnosCuadrante: any[] = [];

  // Variables conectadas al formulario HTML
  tipoSeleccionado: number | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';
  comentarios: string = ''; // Añadida variable comentarios

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController // Inyectado ToastController
  ) {
    addIcons({ sendOutline, calendarOutline, documentTextOutline });
  }

  ngOnInit() {
    this.cargarTipos();
    this.cargarHistorial();
    this.cargarCuadrante();
  }

  cargarTipos() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
      this.http.get('http://localhost:8080/api/solicitudes/tipos', { headers })
        .subscribe({
          next: (respuesta: any) => this.tiposSolicitud = respuesta,
          error: (error) => console.error('Error al cargar tipos', error)
        });
    }
  }

  async enviarSolicitud() {
    // 1. Validaciones previas
    if (!this.tipoSeleccionado || !this.fechaInicio || !this.fechaFin) {
      this.mostrarToast('Por favor, rellena todos los campos', 'warning');
      return;
    }

    if (!this.validarFechas()) {
      return; // La función validarFechas ya muestra su propio alert
    }

    // 2. Recuperamos los datos del empleado
    const datosGuardados = localStorage.getItem('empleadoLogueado');
    const token = localStorage.getItem('token');

    if (!datosGuardados || !token) {
      this.mostrarToast('Error de sesión, por favor re-loguea', 'danger');
      return;
    }

    const empleado = JSON.parse(datosGuardados);

    // 3. Construimos el body exacto para tu controlador Java
    const body = {
      idEmpleado: empleado.idEmpleado,
      idTipo: this.tipoSeleccionado,
      fechaInicio: this.fechaInicio.split('T')[0],
      fechaFin: this.fechaFin.split('T')[0],
      comentarios: this.comentarios
    };

    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:8080/api/solicitudes/nueva', body, { headers })
      .subscribe({
        next: (res) => {
          this.mostrarToast('Solicitud enviada con éxito', 'success');
          this.limpiarFormulario();
          this.cargarHistorial();
        },
        error: (err) => {
          console.error('Error en el servidor:', err);
          this.mostrarToast('Error al guardar en la base de datos', 'danger');
        }
      });
  }

  cargarHistorial() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');
    const token = localStorage.getItem('token');

    if (datosGuardados && token) {
      const empleado = JSON.parse(datosGuardados);
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

      this.http.get(`http://localhost:8080/api/solicitudes/empleado/${empleado.idEmpleado}`, { headers })
        .subscribe({
          next: (respuesta: any) => this.misSolicitudes = respuesta,
          error: (error) => console.error('Error al cargar historial', error)
        });
    }
  }

  cargarCuadrante() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');
    const token = localStorage.getItem('token');
    if (datosGuardados && token) {
      const empleado = JSON.parse(datosGuardados);
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
      this.http.get(`http://localhost:8080/api/cuadrante/empleado/${empleado.idEmpleado}`, { headers })
        .subscribe(res => { this.turnosCuadrante = res as any[]; });
    }
  }

  validarFechas(): boolean {
    const hayDiasLibres = this.turnosCuadrante.some(turno => {
      return turno.fecha >= this.fechaInicio &&
             turno.fecha <= this.fechaFin &&
             turno.turno.toUpperCase() === 'LIBRE';
    });

    if (hayDiasLibres) {
      alert('Atención: Has seleccionado un rango que incluye días en los que ya estás LIBRE.');
      return false;
    }
    return true;
  }

  limpiarFormulario() {
    this.tipoSeleccionado = null;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.comentarios = '';
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
