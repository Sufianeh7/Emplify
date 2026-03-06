import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  sendOutline, calendarOutline, documentTextOutline, airplaneOutline,
  medicalOutline, homeOutline, closeOutline, checkmarkCircleOutline,
  timeOutline, closeCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SolicitudesPage implements OnInit {
  tiposSolicitud: any[] = [];
  misSolicitudes: any[] = [];
  turnosCuadrante: any[] = [];

  // Variables para los contadores
  diasVacaciones: number = 0;
  diasAsuntos: number = 0;

  // Variables del formulario
  tipoSeleccionado: number | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';
  comentarios: string = '';
  hoyISO: string = new Date().toISOString();

  // --- NUEVO: Control del Modal ---
  isModalOpen = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
  ) {
    addIcons({
      sendOutline, calendarOutline, documentTextOutline, airplaneOutline,
      medicalOutline, homeOutline, closeOutline, checkmarkCircleOutline,
      timeOutline, closeCircleOutline
    });
  }

  ngOnInit() {
    this.inicializarDatos();
  }

  inicializarDatos() {
    this.cargarTipos();
    this.cargarCuadrante();
    this.cargarHistorial();
    this.cargarDatosEmpleado();
  }

  cargarDatosEmpleado() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
      this.http
        .get('http://localhost:8080/api/empleados/perfil', { headers })
        .subscribe({
          next: (res: any) => {
            this.diasVacaciones = res.vacacionesDisponibles;
            this.diasAsuntos = res.asuntosPropiosDisponibles;
          },
          error: (err) => console.error('Error al cargar datos del empleado', err),
        });
    }
  }

  // --- CONTROLES DEL MODAL ---
  nuevaSolicitud() {
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.limpiarFormulario();
  }

  // Validación visual del calendario
  isDiaLaboral = (dateString: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaSeleccionada = new Date(dateString);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) return false;

    const fechaISO = dateString.split('T')[0];
    return this.turnosCuadrante.some(
      (t) => t.fecha === fechaISO && t.turno !== 'LIBRE' && t.turno !== 'VACACIONES',
    );
  };

  onFechaInicioChange() {
    if (this.fechaFin && new Date(this.fechaFin) < new Date(this.fechaInicio)) {
      this.fechaFin = '';
    }
  }

  cargarCuadrante() {
    const token = localStorage.getItem('token');
    const empleadoStr = localStorage.getItem('empleadoLogueado');

    if (token && empleadoStr) {
      const empleado = JSON.parse(empleadoStr);
      const idEmpleado = empleado.idEmpleado;
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

      this.http
        .get(`http://localhost:8080/api/cuadrante/empleado/${idEmpleado}`, { headers })
        .subscribe({
          next: (res: any) => (this.turnosCuadrante = res),
          error: (err) => console.error('Error al cargar cuadrante', err),
        });
    }
  }

  cargarTipos() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
      this.http
        .get('http://localhost:8080/api/solicitudes/tipos', { headers })
        .subscribe({
          next: (res: any) => (this.tiposSolicitud = res),
          error: (err) => console.error('Error al cargar tipos', err),
        });
    }
  }

  async enviarSolicitud() {
    if (!this.tipoSeleccionado || !this.fechaInicio || !this.fechaFin) {
      this.mostrarToast('Por favor, rellena todos los campos', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const body = {
      idTipo: this.tipoSeleccionado,
      fechaInicio: this.fechaInicio.split('T')[0],
      fechaFin: this.fechaFin.split('T')[0],
      comentarios: this.comentarios,
    };

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token,
      'Content-Type': 'application/json',
    });

    this.http
      .post('http://localhost:8080/api/solicitudes/nueva', body, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast('Solicitud enviada con éxito', 'success');
          this.cerrarModal(); // <-- NUEVO: Cerramos el modal al tener éxito
          this.cargarHistorial();
          this.cargarDatosEmpleado();
        },
        error: (err) => {
          const msg = err.error?.error || 'Error al guardar la solicitud';
          this.mostrarToast(msg, 'danger');
        },
      });
  }

  cargarHistorial() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
      this.http
        .get(`http://localhost:8080/api/solicitudes/mis-solicitudes`, { headers })
        .subscribe({
          next: (res: any) => (this.misSolicitudes = res),
          error: (err) => console.error('Error al cargar historial', err),
        });
    }
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
      duration: 3000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }
}
