import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular'; // <-- NUEVO: Añadido ToastController
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import {
  calendarOutline, airplaneOutline, megaphoneOutline, ticketOutline,
  personCircleOutline, peopleOutline, briefcaseOutline, settingsOutline,
  logOutOutline, chatboxEllipsesOutline, notificationsCircleOutline,
  timeOutline, bulbOutline, informationCircleOutline, heartOutline,
  playCircleOutline, stopCircleOutline // <-- NUEVO: Iconos de fichaje
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HeaderComponent],
})
export class InicioPage implements OnInit, OnDestroy {
  nombreUsuario: string = '';
  nombreEmpresa: string = '';

  proximoTurno: any = null;
  ultimaPublicacion: any = null;
  noticias: any[] = [];
  indiceSlideActual: number = 0;

  esManager: boolean = false;
  esRRHH: boolean = false;
  esAdmin: boolean = false;

  // --- NUEVO: VARIABLES DE FICHAJE ---
  idEmpleadoLogueado: number = 0;
  trabajando: boolean = false;
  fichajesHoy: any[] = [];
  horaEntradaActual: Date | null = null;
  tiempoActualTrabajando: string = '00:00:00';
  private timerInterval: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController // <-- Inyectado para mostrar mensajes
  ) {
    addIcons({
      calendarOutline, airplaneOutline, megaphoneOutline, ticketOutline,
      personCircleOutline, peopleOutline, briefcaseOutline, settingsOutline,
      logOutOutline, chatboxEllipsesOutline, notificationsCircleOutline,
      timeOutline, bulbOutline, informationCircleOutline, heartOutline,
      playCircleOutline, stopCircleOutline
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');

    if (datosGuardados) {
      const empleado = JSON.parse(datosGuardados);
      this.nombreUsuario = empleado?.usuario?.nombre || empleado?.usuario?.email || 'Compañero/a';
      this.nombreEmpresa = empleado?.empresa?.nombre || 'tu empresa';
      this.idEmpleadoLogueado = empleado?.idEmpleado;

      const rol = empleado.usuario?.rol;
      this.esManager = (rol === 'MANAGER');
      this.esRRHH = (rol === 'RRHH' || rol === 'ADMIN');
      this.esAdmin = (rol === 'ADMIN');

      const idEmpresa = empleado?.empresa?.idEmpresa;

      if (idEmpresa) {
        this.cargarUltimaPublicacion(idEmpresa);
        this.cargarNoticias(idEmpresa);
      }

      if (this.idEmpleadoLogueado) {
        this.cargarProximoTurno(this.idEmpleadoLogueado);
        this.cargarEstadoFichaje(); // <-- LLAMADA INICIAL AL FICHAJE
      }
    }
  }

  ngOnDestroy() {
    this.detenerTemporizador();
  }

  // ==========================================
  // --- CONTROL DEL CARRUSEL Y OTRAS APIS ---
  // ==========================================
  onScrollNoticias(event: any) {
    const contenedor = event.target;
    const anchoTarjeta = contenedor.clientWidth * 0.85;
    this.indiceSlideActual = Math.round(contenedor.scrollLeft / anchoTarjeta);
  }

  cargarNoticias(idEmpresa: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
    this.http.get<any[]>(`http://localhost:8080/api/noticias/empresa/${idEmpresa}`, { headers }).subscribe({
      next: (data) => this.noticias = data,
      error: () => console.warn('No se pudieron cargar las noticias.')
    });
  }

  cargarUltimaPublicacion(idEmpresa: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
    this.http.get<any[]>(`http://localhost:8080/api/voz-empleado/empresa/${idEmpresa}`, { headers }).subscribe({
      next: (publicaciones) => {
        if (publicaciones && publicaciones.length > 0) this.ultimaPublicacion = publicaciones[0];
      }
    });
  }

  cargarProximoTurno(idEmpleado: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
    this.http.get<any>(`http://localhost:8080/api/cuadrante/proximo/${idEmpleado}`, { headers }).subscribe({
      next: (turnoBackend) => {
        if (turnoBackend) {
          this.proximoTurno = {
            fecha: turnoBackend.fecha || 'Fecha por confirmar',
            horario: `${turnoBackend.horaInicio || '00:00'} - ${turnoBackend.horaFin || '00:00'}`
          };
        }
      }
    });
  }

  // ==========================================
  // --- LÓGICA DE FICHAJE (NUEVO) ---
  // ==========================================
  cargarEstadoFichaje() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get<any>(`http://localhost:8080/api/fichajes/estado/${this.idEmpleadoLogueado}`, { headers }).subscribe({
      next: (res) => {
        this.fichajesHoy = res.fichajes || [];
        this.trabajando = res.trabajando;

        if (this.trabajando && res.horaEntradaActual) {
          this.horaEntradaActual = new Date(res.horaEntradaActual);
          this.iniciarTemporizador();
        } else {
          this.detenerTemporizador();
          this.horaEntradaActual = null;
        }
      },
      error: (err) => console.error('Error cargando fichajes', err)
    });
  }

  ficharEntrada() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.post(`http://localhost:8080/api/fichajes/entrada/${this.idEmpleadoLogueado}`, {}, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Entrada registrada con éxito', 'success');
        this.cargarEstadoFichaje(); // Recargamos para ver el cronómetro
      },
      error: (err) => this.mostrarToast(err.error?.error || 'Error al fichar entrada', 'danger')
    });
  }

  ficharSalida() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.put(`http://localhost:8080/api/fichajes/salida/${this.idEmpleadoLogueado}`, {}, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Salida registrada con éxito', 'success');
        this.cargarEstadoFichaje(); // Recargamos para parar el cronómetro
      },
      error: (err) => this.mostrarToast(err.error?.error || 'Error al fichar salida', 'danger')
    });
  }

  iniciarTemporizador() {
    this.detenerTemporizador(); // Limpiamos si hubiera uno previo
    this.actualizarCronometro(); // Llamada inmediata
    this.timerInterval = setInterval(() => {
      this.actualizarCronometro();
    }, 1000); // Se actualiza cada segundo
  }

  detenerTemporizador() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  actualizarCronometro() {
    if (!this.horaEntradaActual) return;
    const ahora = new Date();
    const difMs = ahora.getTime() - this.horaEntradaActual.getTime();

    // Convertir milisegundos a HH:mm:ss
    const horas = Math.floor(difMs / (1000 * 60 * 60));
    const minutos = Math.floor((difMs % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((difMs % (1000 * 60)) / 1000);

    const pad = (num: number) => num.toString().padStart(2, '0');
    this.tiempoActualTrabajando = `${pad(horas)}:${pad(minutos)}:${pad(segundos)}`;
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

  // --- NAVEGACIÓN ---
  goCuadrante() { this.router.navigate(['/cuadrante'], { queryParams: { tab: 'horario' } }); }
  goSolicitudes() { this.router.navigate(['/cuadrante'], { queryParams: { tab: 'ausencias' } }); }
  goVozEmpleado() { this.router.navigate(['/voz-empleado']); }
  goTickets() { this.router.navigate(['/tickets']); }
  goPerfil() { this.router.navigate(['/perfil']); }
  goEquipo() { this.router.navigate(['/equipo']); }
  goGestionRRHH() { this.router.navigate(['/gestion-rrhh']); }
  goGestionCuadrantes() { this.router.navigate(['/cuadrantes']); }
  goAdmin() { this.router.navigate(['/admin']); }
}
