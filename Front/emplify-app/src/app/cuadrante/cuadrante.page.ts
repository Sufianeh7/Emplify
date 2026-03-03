import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // IMPORTANTE para que funcione el *ngIf
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import { timeOutline, happyOutline, ellipse } from 'ionicons/icons';

@Component({
  selector: 'app-cuadrante',
  templateUrl: './cuadrante.page.html',
  styleUrls: ['./cuadrante.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CuadrantePage implements OnInit {

  turnos: any[] = []; // La lista cruda de la base de datos
  diasDestacados: any[] = []; // La lista formateada para pintar el calendario

  turnoElegido: any = null; // Guardará el turno del día que toques
  fechaElegidaNormal: string = ''; // Para mostrar "2026-03-01" más bonito

  constructor(private http: HttpClient) {
    addIcons({ timeOutline, happyOutline, ellipse });
  }

  ngOnInit() {
    this.cargarCuadrante();
  }

  cargarCuadrante() {
    const token = localStorage.getItem('token');

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': 'Basic ' + token
      });

      // Pedimos los turnos del año en curso
      const añoActual = new Date().getFullYear();
      const inicio = `${añoActual}-01-01`;
      const fin = `${añoActual}-12-31`;

      // NUEVO ENDPOINT: No necesita el ID del empleado porque usa el Token (Principal)
      this.http.get(`http://localhost:8080/api/turnos/mis-turnos?inicio=${inicio}&fin=${fin}`, { headers })
        .subscribe({
          next: (respuesta: any) => {
            this.turnos = respuesta;
            this.procesarTurnosParaCalendario();
          },
          error: (error) => {
            console.error('Error al cargar el cuadrante', error);
          }
        });
    }
  }

  // 1. Coge los turnos de la BD y los prepara para el calendario
  procesarTurnosParaCalendario() {
    this.diasDestacados = this.turnos.map(turno => {
      return {
        date: turno.fecha, // Tiene que estar en formato "YYYY-MM-DD"
        textColor: '#ffffff', // Letra blanca
        // ACTUALIZADO: En la base de datos se llama 'tipo'
        backgroundColor: this.obtenerColorPorTurno(turno.tipo)
      };
    });
  }

  // 2. Diccionario de colores corporativos
  obtenerColorPorTurno(tipoTurno: string): string {
    if (!tipoTurno) return '#3880ff';
    switch(tipoTurno.toUpperCase()) {
      case 'MAÑANA': return '#2dd36f'; // Verde
      case 'TARDE': return '#ffc409';  // Naranja/Amarillo
      case 'NOCHE': return '#5260ff';  // Azul
      case 'LIBRE': return '#92949c';  // Gris
      case 'VACACIONES': return '#eb445a'; // Rojo
      default: return '#3880ff';
    }
  }

  // 3. Esta función salta cuando el usuario toca un día en el calendario
  diaSeleccionado(event: any) {
    if (!event.detail.value) return;

    // Aseguramos sacar el string correctamente y lo cortamos por la 'T'
    const valorPulsado = Array.isArray(event.detail.value) ? event.detail.value[0] : event.detail.value;
    const fechaTocada = valorPulsado.split('T')[0];

    // Buscamos si en nuestra lista de turnos hay alguno para ese día
    const turnoEncontrado = this.turnos.find(t => t.fecha === fechaTocada);

    if (turnoEncontrado) {
      this.turnoElegido = turnoEncontrado;
      this.fechaElegidaNormal = fechaTocada;
    } else {
      // Si toca un día que no tiene turno asignado, ocultamos la tarjeta
      this.turnoElegido = null;
    }
  }
}
