import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import {
  sendOutline, calendarOutline, documentTextOutline,
  closeOutline, checkmarkCircleOutline, timeOutline,
  closeCircleOutline, chatboxEllipsesOutline
} from 'ionicons/icons';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SolicitudesPage implements OnInit {

  // Listados de datos
  tiposSolicitud: any[] = [];
  misSolicitudes: any[] = [];

  // Contadores de días disponibles
  diasVacaciones: number = 0;
  diasAsuntos: number = 0;

  // Modelo del formulario
  tipoSeleccionado: number | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';
  comentarios: string = '';
  hoyISO: string = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD nativo

  // Control de la ventana emergente (Modal)
  isModalOpen = false;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
  ) {
    addIcons({
      sendOutline, calendarOutline, documentTextOutline,
      closeOutline, checkmarkCircleOutline, timeOutline,
      closeCircleOutline, chatboxEllipsesOutline
    });
  }

  // Se ejecuta al montar el componente
  ngOnInit() {
    this.inicializarDatos();
  }

  // Orquesta la descarga de datos inicial
  inicializarDatos() {
    this.cargarTipos();
    this.cargarHistorial();
    this.cargarDatosEmpleado();
  }

  // Obtiene el saldo de días de vacaciones y asuntos propios
  cargarDatosEmpleado() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
      this.http.get(environment.apiUrl+'/empleados/perfil', { headers }).subscribe({
          next: (res: any) => {
            this.diasVacaciones = res.vacacionesDisponibles;
            this.diasAsuntos = res.asuntosPropiosDisponibles;
          },
          error: (err) => console.error('Error al cargar datos del empleado', err),
        });
    }
  }

  // Abre el modal para crear nueva solicitud
  nuevaSolicitud() {
    this.isModalOpen = true;
  }

  // Cierra el modal y resetea los campos
  cerrarModal() {
    this.isModalOpen = false;
    this.limpiarFormulario();
  }

  // Evita que la fecha final sea anterior a la inicial
  onFechaInicioChange() {
    if (this.fechaFin && new Date(this.fechaFin) < new Date(this.fechaInicio)) {
      this.fechaFin = '';
    }
  }

  // Descarga el catálogo de motivos (Vacaciones, Baja Médica, etc.)
  cargarTipos() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
      this.http.get(environment.apiUrl+'/solicitudes/tipos', { headers }).subscribe({
          next: (res: any) => (this.tiposSolicitud = res),
          error: (err) => console.error('Error al cargar tipos', err),
        });
    }
  }

  // Descarga las peticiones pasadas del empleado
  cargarHistorial() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
      this.http.get(environment.apiUrl+`/solicitudes/mis-solicitudes`, { headers }).subscribe({
          next: (res: any) => (this.misSolicitudes = res),
          error: (err) => console.error('Error al cargar historial', err),
        });
    }
  }

  // Manda los datos al backend para registrar la petición
  async enviarSolicitud() {
    if (!this.tipoSeleccionado || !this.fechaInicio || !this.fechaFin) {
      this.mostrarToast('Por favor, rellena todos los campos', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const body = {
      idTipo: this.tipoSeleccionado,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      comentarios: this.comentarios,
    };

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token,
      'Content-Type': 'application/json',
    });

    this.http.post(environment.apiUrl+'/solicitudes/nueva', body, { headers }).subscribe({
        next: () => {
          this.mostrarToast('Solicitud enviada con éxito', 'success');
          this.cerrarModal();
          this.cargarHistorial(); // Refresca la lista
          this.cargarDatosEmpleado(); // Refresca el saldo
        },
        error: (err) => {
          const msg = err.error?.error || 'Error al guardar la solicitud';
          this.mostrarToast(msg, 'danger');
        },
      });
  }

  // Deja los inputs en blanco
  limpiarFormulario() {
    this.tipoSeleccionado = null;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.comentarios = '';
  }

  // Muestra una notificación
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
