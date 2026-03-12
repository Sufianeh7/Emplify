import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  partlySunnyOutline, sunnyOutline, moonOutline, happyOutline,
  logInOutline, logOutOutline
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
  fichajesTotales: any[] = [];
  fichajesDelDiaElegido: any[] = [];

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private route: ActivatedRoute
  ) {
    addIcons({
      partlySunnyOutline, sunnyOutline, moonOutline, happyOutline,
      logInOutline, logOutOutline
    });
  }

  // Se ejecuta SOLO LA PRIMERA VEZ. Escucha los parámetros de la URL de forma continua.
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.vistaActual = params['tab'];
      }
    });
  }

  // Se ejecuta SIEMPRE que entramos a la pantalla (refresco automático de datos)
  ionViewWillEnter() {
    this.inicializarDatos();
  }

  // Llama a las funciones encargadas de traer los datos del backend
  inicializarDatos() {
    this.cargarCuadrante();
    this.cargarHistorialFichajes();
  }

  // Obtiene todos los turnos del empleado desde la API
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

  // Pinta los puntitos azules en el calendario para los días que tienen turno de trabajo
  procesarTurnosParaCalendario() {
    this.diasDestacados = this.turnos
      .filter(t => t.turno !== 'LIBRE' && t.turno !== 'VACACIONES')
      .map(turno => ({
        date: turno.fecha,
        textColor: '#0071ad',
        backgroundColor: 'rgba(0, 113, 173, 0.1)'
      }));
  }

  // Descarga todo el histórico de fichajes del empleado
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

            // Si el usuario ya tenía un día tocado en el calendario, refrescamos esa lista específica
            if (this.fechaElegidaNormal) {
              this.filtrarFichajesPorDia(this.fechaElegidaNormal);
            }
          },
          error: (err) => console.error('Error cargando historial de fichajes', err)
        });
    }
  }

  // Se ejecuta al tocar un día en el calendario para mostrar su turno y fichajes
  diaSeleccionado(event: any) {
    if (!event.detail.value) return;

    // Extraemos solo la fecha (YYYY-MM-DD)
    const valorPulsado = Array.isArray(event.detail.value) ? event.detail.value[0] : event.detail.value;
    const fechaTocada = valorPulsado.split('T')[0];

    // Buscamos si hay turno para ese día
    const turnoEncontrado = this.turnos.find(t => t.fecha === fechaTocada);

    this.fechaElegidaNormal = fechaTocada;
    this.turnoElegido = turnoEncontrado || null;

    this.filtrarFichajesPorDia(fechaTocada);
  }

  // Filtra de la lista total de fichajes solo los que coinciden con el día seleccionado
  filtrarFichajesPorDia(fechaSeleccionada: string) {
    this.fichajesDelDiaElegido = this.fichajesTotales.filter(f => {
      const fechaFichaje = f.horaEntrada.split('T')[0];
      return fechaFichaje === fechaSeleccionada;
    });
  }
}
