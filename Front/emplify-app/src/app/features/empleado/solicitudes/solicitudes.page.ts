import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  sendOutline,
  calendarOutline,
  documentTextOutline,
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
  turnosCuadrante: any[] = []; // Ahora vendrá de la tabla Cuadrante

  // Variables para los contadores
  diasVacaciones: number = 0;
  diasAsuntos: number = 0;

  tipoSeleccionado: number | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';
  comentarios: string = '';

  hoyISO: string = new Date().toISOString();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
  ) {
    addIcons({ sendOutline, calendarOutline, documentTextOutline });
  }

  ngOnInit() {
    this.inicializarDatos();
  }

  // Agrupamos cargas para mayor limpieza
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

  // Validación visual del calendario
  isDiaLaboral = (dateString: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaSeleccionada = new Date(dateString);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    // No permitir días pasados
    if (fechaSeleccionada < hoy) return false;

    // Solo permitir días que existan en el cuadrante y no sean LIBRE ni VACACIONES
    const fechaISO = dateString.split('T')[0];
    return this.turnosCuadrante.some(
      // CAMBIO 1: Cambiado 't.tipo' por 't.turno' para que coincida con la BD
      (t) => t.fecha === fechaISO && t.turno !== 'LIBRE' && t.turno !== 'VACACIONES',
    );
  };

  // IMPORTANTE: Al cambiar fecha inicio, validamos la fecha fin
  onFechaInicioChange() {
    if (this.fechaFin && new Date(this.fechaFin) < new Date(this.fechaInicio)) {
      this.fechaFin = ''; // Resetear si la fecha fin es incoherente
    }
  }

  cargarCuadrante() {
    const token = localStorage.getItem('token');
    const empleadoStr = localStorage.getItem('empleadoLogueado');

    if (token && empleadoStr) {
      const empleado = JSON.parse(empleadoStr);
      const idEmpleado = empleado.idEmpleado;

      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

      // CAMBIO 2: Actualizado al endpoint seguro de la tabla Cuadrante
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
          this.limpiarFormulario();
          this.cargarHistorial();
          this.cargarDatosEmpleado();
        },
        error: (err) => {
          // Aquí capturamos el error 400 del Backend (solapamiento, días insuficientes, etc.)
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
