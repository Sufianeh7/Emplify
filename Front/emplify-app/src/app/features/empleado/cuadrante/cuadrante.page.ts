import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router'; // <-- NUEVO: Para leer los queryParams

import { addIcons } from 'ionicons';
import {
  timeOutline, happyOutline, ellipse, chatboxEllipsesOutline,
  personCircleOutline, notificationsOutline, airplaneOutline,
  sendOutline, calendarOutline, documentTextOutline
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { SolicitudesPage } from '../solicitudes/solicitudes.page';

@Component({
  selector: 'app-cuadrante',
  templateUrl: './cuadrante.page.html',
  styleUrls: ['./cuadrante.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, SolicitudesPage]
})
export class CuadrantePage implements OnInit {

  vistaActual: string = 'horario'; // Controla el ion-segment

  // --- DATOS DEL CUADRANTE ---
  turnos: any[] = [];
  diasDestacados: any[] = [];
  turnoElegido: any = null;
  fechaElegidaNormal: string = '';

  // --- DATOS DE SOLICITUDES ---
  tiposSolicitud: any[] = [];
  misSolicitudes: any[] = [];
  diasVacaciones: number = 0;
  diasAsuntos: number = 0;
  tipoSeleccionado: number | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';
  comentarios: string = '';
  hoyISO: string = new Date().toISOString();

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private route: ActivatedRoute // <-- NUEVO: Inyectamos el ActivatedRoute
  ) {
    addIcons({
      timeOutline, happyOutline, ellipse, chatboxEllipsesOutline,
      personCircleOutline, notificationsOutline, airplaneOutline,
      sendOutline, calendarOutline, documentTextOutline
    });
  }

  ngOnInit() {
    // --- NUEVO: Escuchamos la URL para ver qué pestaña debemos abrir ---
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.vistaActual = params['tab'];
      }
    });

    this.inicializarDatos();
  }

  inicializarDatos() {
    this.cargarDatosEmpleado();
    this.cargarCuadrante();
    this.cargarTipos();
    this.cargarHistorial();
  }

  // ==========================================
  // LÓGICA DEL CUADRANTE (CALENDARIO)
  // ==========================================
  cargarCuadrante() {
    const token = localStorage.getItem('token');
    const empleadoStr = localStorage.getItem('empleadoLogueado');

    if (token && empleadoStr) {
      const empleado = JSON.parse(empleadoStr);
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

      this.http.get(`http://localhost:8080/api/cuadrante/empleado/${empleado.idEmpleado}`, { headers })
        .subscribe({
          next: (res: any) => {
            this.turnos = res;
            this.procesarTurnosParaCalendario();
          },
          error: (err) => console.error('Error cuadrante', err)
        });
    }
  }

  procesarTurnosParaCalendario() {
    this.diasDestacados = this.turnos.map(turno => ({
      date: turno.fecha,
      textColor: '#ffffff',
      backgroundColor: this.obtenerColorPorTurno(turno.turno)
    }));
  }

  obtenerColorPorTurno(tipoTurno: string): string {
    if (!tipoTurno) return '#3880ff';
    switch(tipoTurno.toUpperCase()) {
      case 'MAÑANA': return '#2dd36f';
      case 'TARDE': return '#ffc409';
      case 'NOCHE': return '#5260ff';
      case 'LIBRE': return '#92949c';
      case 'VACACIONES': return '#eb445a';
      default: return '#3880ff';
    }
  }

  diaSeleccionado(event: any) {
    if (!event.detail.value) return;
    const valorPulsado = Array.isArray(event.detail.value) ? event.detail.value[0] : event.detail.value;
    const fechaTocada = valorPulsado.split('T')[0];
    const turnoEncontrado = this.turnos.find(t => t.fecha === fechaTocada);

    if (turnoEncontrado) {
      this.turnoElegido = turnoEncontrado;
      this.fechaElegidaNormal = fechaTocada;
    } else {
      this.turnoElegido = null;
    }
  }

  // ==========================================
  // LÓGICA DE SOLICITUDES (AUSENCIAS)
  // ==========================================
  cargarDatosEmpleado() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
      this.http.get('http://localhost:8080/api/empleados/perfil', { headers }).subscribe({
          next: (res: any) => {
            this.diasVacaciones = res.vacacionesDisponibles;
            this.diasAsuntos = res.asuntosPropiosDisponibles;
          }
        });
    }
  }

  cargarTipos() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
      this.http.get('http://localhost:8080/api/solicitudes/tipos', { headers }).subscribe({
          next: (res: any) => (this.tiposSolicitud = res)
        });
    }
  }

  cargarHistorial() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
      this.http.get(`http://localhost:8080/api/solicitudes/mis-solicitudes`, { headers }).subscribe({
          next: (res: any) => (this.misSolicitudes = res)
        });
    }
  }

  isDiaLaboral = (dateString: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(dateString);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) return false;
    const fechaISO = dateString.split('T')[0];

    return this.turnos.some(t => t.fecha === fechaISO && t.turno !== 'LIBRE' && t.turno !== 'VACACIONES');
  };

  onFechaInicioChange() {
    if (this.fechaFin && new Date(this.fechaFin) < new Date(this.fechaInicio)) {
      this.fechaFin = '';
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

    this.http.post('http://localhost:8080/api/solicitudes/nueva', body, { headers }).subscribe({
        next: () => {
          this.mostrarToast('Solicitud enviada con éxito', 'success');
          this.limpiarFormulario();
          this.cargarHistorial();
          this.cargarDatosEmpleado();
        },
        error: (err) => {
          const msg = err.error?.error || 'Error al guardar la solicitud';
          this.mostrarToast(msg, 'danger');
        },
      });
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
