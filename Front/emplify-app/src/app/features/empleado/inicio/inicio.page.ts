import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  calendarOutline, airplaneOutline, megaphoneOutline,
  timeOutline, informationCircleOutline, heartOutline,
  playCircleOutline, stopCircleOutline
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
  // Datos principales
  nombreUsuario: string = '';
  idEmpleadoLogueado: number = 0;

  // Comunicación y turnos
  proximoTurno: any = null;
  ultimaPublicacion: any = null;
  noticias: any[] = [];
  indiceSlideActual: number = 0;

  // Control de fichaje
  trabajando: boolean = false;
  fichajesHoy: any[] = [];
  horaEntradaActual: Date | null = null;
  tiempoActualTrabajando: string = '00:00:00';
  private timerInterval: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      calendarOutline, airplaneOutline, megaphoneOutline,
      timeOutline, informationCircleOutline, heartOutline,
      playCircleOutline, stopCircleOutline
    });
  }

  ngOnInit() {}

  // Se ejecuta cada vez que el usuario entra en esta pantalla
  ionViewWillEnter() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');

    if (datosGuardados) {
      const empleado = JSON.parse(datosGuardados);
      this.nombreUsuario = empleado?.usuario?.nombre || empleado?.usuario?.email || 'Compañero/a';
      this.idEmpleadoLogueado = empleado?.idEmpleado;
      const idEmpresa = empleado?.empresa?.idEmpresa;

      if (idEmpresa) {
        this.cargarUltimaPublicacion(idEmpresa);
        this.cargarNoticias(idEmpresa);
      }

      if (this.idEmpleadoLogueado) {
        this.cargarProximoTurno(this.idEmpleadoLogueado);
        this.cargarEstadoFichaje();
      }
    }
  }

  // Limpia el temporizador para evitar fugas de memoria al salir de la vista
  ngOnDestroy() {
    this.detenerTemporizador();
  }

  // --- OBTENCIÓN DE DATOS ---
  // Controla qué punto del carrusel se ilumina al deslizar
  onScrollNoticias(event: any) {
    const contenedor = event.target;
    const anchoTarjeta = contenedor.clientWidth * 0.85;
    this.indiceSlideActual = Math.round(contenedor.scrollLeft / anchoTarjeta);
  }

  // Carga las noticias
  cargarNoticias(idEmpresa: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
    this.http.get<any[]>(`http://localhost:8080/api/noticias/empresa/${idEmpresa}`, { headers }).subscribe({
      next: (data) => this.noticias = data,
      error: () => console.warn('No se pudieron cargar las noticias.')
    });
  }

  // Carga el comunicado más reciente
  cargarUltimaPublicacion(idEmpresa: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
    this.http.get<any[]>(`http://localhost:8080/api/voz-empleado/empresa/${idEmpresa}`, { headers }).subscribe({
      next: (publicaciones) => {
        if (publicaciones && publicaciones.length > 0) this.ultimaPublicacion = publicaciones[0];
      }
    });
  }

// Busca cuándo es el siguiente turno laboral
  cargarProximoTurno(idEmpleado: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get<any>(`http://localhost:8080/api/cuadrante/proximo/${idEmpleado}`, { headers }).subscribe({
      next: (turnoBackend) => {
        if (turnoBackend) {
          // 1. Miramos qué tipo de turno nos manda el Backend (MAÑANA, TARDE, NOCHE)
          const tipoTurno = turnoBackend.turno?.toUpperCase();
          let horasAsignadas = 'Horario sin definir';

          // 2. Lo traducimos a horas reales
          if (tipoTurno === 'MAÑANA') horasAsignadas = '08:00 - 16:00';
          else if (tipoTurno === 'TARDE') horasAsignadas = '16:00 - 00:00';
          else if (tipoTurno === 'NOCHE') horasAsignadas = '00:00 - 08:00';

          // 3. Lo guardamos para que el HTML lo pinte perfecto
          this.proximoTurno = {
            fecha: turnoBackend.fecha || 'Fecha por confirmar',
            horario: horasAsignadas
          };
        }
      },
      error: (err) => console.error('No se pudo cargar el próximo turno', err)
    });
  }

  // --- LÓGICA DE FICHAJE ---
  // Comprueba si el usuario está trabajando hoy y carga su línea temporal
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

  // Inicia la jornada laboral
  ficharEntrada() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.post(`http://localhost:8080/api/fichajes/entrada/${this.idEmpleadoLogueado}`, {}, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Entrada registrada con éxito', 'success');
        this.cargarEstadoFichaje();
      },
      error: (err) => this.mostrarToast(err.error?.error || 'Error al fichar entrada', 'danger')
    });
  }

  // Termina la jornada laboral
  ficharSalida() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.put(`http://localhost:8080/api/fichajes/salida/${this.idEmpleadoLogueado}`, {}, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Salida registrada con éxito', 'success');
        this.cargarEstadoFichaje();
      },
      error: (err) => this.mostrarToast(err.error?.error || 'Error al fichar salida', 'danger')
    });
  }

  // --- TEMPORIZADOR DE FICHAJE ---
  iniciarTemporizador() {
    this.detenerTemporizador();
    this.actualizarCronometro();
    this.timerInterval = setInterval(() => this.actualizarCronometro(), 1000);
  }

  detenerTemporizador() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  actualizarCronometro() {
    if (!this.horaEntradaActual) return;
    const ahora = new Date();
    const difMs = ahora.getTime() - this.horaEntradaActual.getTime();

    const horas = Math.floor(difMs / (1000 * 60 * 60));
    const minutos = Math.floor((difMs % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((difMs % (1000 * 60)) / 1000);

    const pad = (num: number) => num.toString().padStart(2, '0');
    this.tiempoActualTrabajando = `${pad(horas)}:${pad(minutos)}:${pad(segundos)}`;
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({ message: mensaje, duration: 3000, color, position: 'bottom' });
    toast.present();
  }

  // --- NAVEGACIÓN ---
  goCuadrante() { this.router.navigate(['/cuadrante'], { queryParams: { tab: 'horario' } }); }
  goSolicitudes() { this.router.navigate(['/cuadrante'], { queryParams: { tab: 'ausencias' } }); }
  goVozEmpleado() { this.router.navigate(['/voz-empleado']); }
  goNoticias() { this.router.navigate(['/noticias']); }
}
