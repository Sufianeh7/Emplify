import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import {
  calendarOutline, airplaneOutline, megaphoneOutline, ticketOutline,
  personCircleOutline, peopleOutline, briefcaseOutline, settingsOutline,
  logOutOutline, chatboxEllipsesOutline, notificationsCircleOutline,
  timeOutline, bulbOutline, informationCircleOutline, heartOutline
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HeaderComponent],
})
export class InicioPage implements OnInit {
  nombreUsuario: string = '';
  nombreEmpresa: string = '';

  // Lo inicializamos a nulo. Si el backend trae datos, lo llenaremos.
  proximoTurno: any = null;
  ultimaPublicacion: any = null;
  noticias: any[] = [];

  // --- NUEVO: Variable para controlar el puntito activo del carrusel ---
  indiceSlideActual: number = 0;

  esManager: boolean = false;
  esRRHH: boolean = false;
  esAdmin: boolean = false;

  constructor(private router: Router, private http: HttpClient) {
    addIcons({
      calendarOutline, airplaneOutline, megaphoneOutline, ticketOutline,
      personCircleOutline, peopleOutline, briefcaseOutline, settingsOutline,
      logOutOutline, chatboxEllipsesOutline, notificationsCircleOutline,
      timeOutline, bulbOutline, informationCircleOutline, heartOutline
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');

    if (datosGuardados) {
      const empleado = JSON.parse(datosGuardados);
      this.nombreUsuario = empleado?.usuario?.nombre || empleado?.usuario?.email || 'Compañero/a';
      this.nombreEmpresa = empleado?.empresa?.nombre || 'tu empresa';

      const rol = empleado.usuario?.rol;
      this.esManager = (rol === 'MANAGER');
      this.esRRHH = (rol === 'RRHH' || rol === 'ADMIN');
      this.esAdmin = (rol === 'ADMIN');

      // --- LLAMADAS A LA BD PARA TRAER DATOS REALES ---
      const idEmpresa = empleado?.empresa?.idEmpresa;
      const idEmpleado = empleado?.idEmpleado; // Extraemos también el ID del empleado

      if (idEmpresa) {
        this.cargarUltimaPublicacion(idEmpresa);
        this.cargarNoticias(idEmpresa); // Llamada al carrusel
      }

      if (idEmpleado) {
        this.cargarProximoTurno(idEmpleado); // Llamada al turno
      }
    }
  }

  // ==========================================
  // --- CONTROL DEL CARRUSEL ---
  // ==========================================
  onScrollNoticias(event: any) {
    const contenedor = event.target;
    // La tarjeta ocupa un 85% del ancho, así que calculamos en base a eso
    const anchoTarjeta = contenedor.clientWidth * 0.85;
    // Actualizamos el índice de la tarjeta actual según la posición del scroll
    this.indiceSlideActual = Math.round(contenedor.scrollLeft / anchoTarjeta);
  }

  // ==========================================
  // --- LLAMADAS A LA API ---
  // ==========================================

  // 1. CARGAR NOTICIAS DEL CARRUSEL
  cargarNoticias(idEmpresa: number) {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get<any[]>(`http://localhost:8080/api/noticias/empresa/${idEmpresa}`, { headers }).subscribe({
      next: (data) => {
        this.noticias = data;
      },
      error: (err) => {
        console.warn('Aviso: No se pudieron cargar las noticias.', err.message);
      }
    });
  }

  // 2. CARGAR VOZ DEL EMPLEADO
  cargarUltimaPublicacion(idEmpresa: number) {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get<any[]>(`http://localhost:8080/api/voz-empleado/empresa/${idEmpresa}`, { headers }).subscribe({
      next: (publicaciones) => {
        if (publicaciones && publicaciones.length > 0) {
          this.ultimaPublicacion = publicaciones[0];
        }
      },
      error: (err) => {
        console.warn('Aviso al cargar la voz del empleado:', err.message);
      }
    });
  }

  // 3. CARGAR EL PRÓXIMO TURNO
  cargarProximoTurno(idEmpleado: number) {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get<any>(`http://localhost:8080/api/cuadrante/proximo/${idEmpleado}`, { headers }).subscribe({
      next: (turnoBackend) => {
        if (turnoBackend) {
          this.proximoTurno = {
            fecha: turnoBackend.fecha || 'Fecha por confirmar',
            horario: `${turnoBackend.horaInicio || '00:00'} - ${turnoBackend.horaFin || '00:00'}`
          };
        }
      },
      error: (err) => {
        console.warn('Aviso: No se pudo cargar el próximo turno (o no hay turnos programados).', err.message);
      }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/home']);
  }

  // --- NAVEGACIÓN ---
// --- NAVEGACIÓN ---
  goCuadrante() {
    // Vamos al cuadrante y le decimos que abra la pestaña de horario
    this.router.navigate(['/cuadrante'], { queryParams: { tab: 'horario' } });
  }

  goSolicitudes() {
    // Vamos al cuadrante, pero le decimos que auto-seleccione las ausencias
    this.router.navigate(['/cuadrante'], { queryParams: { tab: 'ausencias' } });
  }

  goVozEmpleado() { this.router.navigate(['/voz-empleado']); }
  goTickets() { this.router.navigate(['/tickets']); }
  goPerfil() { this.router.navigate(['/perfil']); }
  goEquipo() { this.router.navigate(['/equipo']); }
  goGestionRRHH() { this.router.navigate(['/gestion-rrhh']); }
  goGestionCuadrantes() { this.router.navigate(['/cuadrantes']); }
  goAdmin() { this.router.navigate(['/admin']); }
}
