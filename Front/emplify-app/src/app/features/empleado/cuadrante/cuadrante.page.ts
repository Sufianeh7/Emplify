import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  timeOutline, happyOutline, ellipse, chatboxEllipsesOutline,
  personCircleOutline, notificationsOutline, airplaneOutline,
  sendOutline, calendarOutline, documentTextOutline,
  partlySunnyOutline, sunnyOutline, moonOutline,
  logInOutline, logOutOutline // <-- Añadimos iconos para entrada/salida
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

  vistaActual: string = 'horario';

  // --- DATOS DEL CUADRANTE ---
  turnos: any[] = [];
  diasDestacados: any[] = [];
  turnoElegido: any = null;
  fechaElegidaNormal: string = '';

  // --- DATOS DE FICHAJE ---
  fichajesTotales: any[] = []; // Todos los fichajes del empleado
  fichajesDelDiaElegido: any[] = []; // Los que coinciden con el día tocado

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
    private route: ActivatedRoute
  ) {
    addIcons({
      timeOutline, happyOutline, ellipse, chatboxEllipsesOutline,
      personCircleOutline, notificationsOutline, airplaneOutline,
      sendOutline, calendarOutline, documentTextOutline, partlySunnyOutline,
      sunnyOutline, moonOutline, logInOutline, logOutOutline
    });
  }

  ngOnInit() {
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
    this.cargarHistorialFichajes(); // <-- NUEVA LLAMADA
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
    this.diasDestacados = this.turnos
      .filter(t => t.turno !== 'LIBRE' && t.turno !== 'VACACIONES')
      .map(turno => ({
        date: turno.fecha,
        textColor: '#0071ad',
        backgroundColor: 'rgba(0, 113, 173, 0.1)'
      }));
  }

  // ==========================================
  // LÓGICA DE FICHAJES (NUEVO)
  // ==========================================
  cargarHistorialFichajes() {
    const token = localStorage.getItem('token');
    const empleadoStr = localStorage.getItem('empleadoLogueado');

    if (token && empleadoStr) {
      const empleado = JSON.parse(empleadoStr);
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

      this.http.get(`http://localhost:8080/api/fichajes/historial/${empleado.idEmpleado}`, { headers })
        .subscribe({
          next: (res: any) => {
            this.fichajesTotales = res;
            // Si hay un día seleccionado, refrescamos sus fichajes
            if (this.fechaElegidaNormal) {
              this.filtrarFichajesPorDia(this.fechaElegidaNormal);
            }
          },
          error: (err) => console.error('Error cargando historial de fichajes', err)
        });
    }
  }

  diaSeleccionado(event: any) {
    if (!event.detail.value) return;
    const valorPulsado = Array.isArray(event.detail.value) ? event.detail.value[0] : event.detail.value;
    const fechaTocada = valorPulsado.split('T')[0];
    const turnoEncontrado = this.turnos.find(t => t.fecha === fechaTocada);

    this.fechaElegidaNormal = fechaTocada;

    if (turnoEncontrado) {
      this.turnoElegido = turnoEncontrado;
    } else {
      this.turnoElegido = null;
    }

    // Siempre buscamos los fichajes del día, tenga turno asignado o no
    this.filtrarFichajesPorDia(fechaTocada);
  }

  filtrarFichajesPorDia(fechaSeleccionada: string) {
    this.fichajesDelDiaElegido = this.fichajesTotales.filter(f => {
      // Extraemos la parte "YYYY-MM-DD" del fichaje
      const fechaFichaje = f.horaEntrada.split('T')[0];
      return fechaFichaje === fechaSeleccionada;
    });
  }

  // ==========================================
  // LÓGICA DE SOLICITUDES (AUSENCIAS) -> Igual que antes
  // ==========================================
  cargarDatosEmpleado() { /* ... igual ... */ }
  cargarTipos() { /* ... igual ... */ }
  cargarHistorial() { /* ... igual ... */ }
  isDiaLaboral = (dateString: string) => { /* ... igual ... */ return false;};
  onFechaInicioChange() { /* ... igual ... */ }
  async enviarSolicitud() { /* ... igual ... */ }
  limpiarFormulario() { /* ... igual ... */ }
  async mostrarToast(mensaje: string, color: string) { /* ... igual ... */ }
}
