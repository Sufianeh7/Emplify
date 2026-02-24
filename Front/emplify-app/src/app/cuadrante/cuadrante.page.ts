import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // IMPORTANTE para que funcione el *ngIf
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import { timeOutline, happyOutline } from 'ionicons/icons';

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
    addIcons({timeOutline, happyOutline})
  }

  ngOnInit() {
    this.cargarCuadrante();
  }

  cargarCuadrante() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');
    const token = localStorage.getItem('token');

    if (datosGuardados && token) {
      const empleado = JSON.parse(datosGuardados);
      const idEmpleado = empleado[0].idEmpleado;

      const headers = new HttpHeaders({
        'Authorization': 'Basic ' + token
      });

      this.http.get(`http://localhost:8080/api/cuadrante/empleado/${idEmpleado}`, { headers: headers })
        .subscribe({
          next: (respuesta: any) => {
            this.turnos = respuesta;

            // ---> AQUÍ LLAMAMOS A LA MAGIA DE LOS COLORES <---
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
    // Transformamos nuestra lista de turnos en el formato que exige Ionic
    this.diasDestacados = this.turnos.map(turno => {
      return {
        date: turno.fecha, // Tiene que estar en formato "YYYY-MM-DD"
        textColor: '#ffffff', // Letra blanca
        backgroundColor: this.obtenerColorPorTurno(turno.turno) // Color de fondo según el tipo
      };
    });
  }

  // 2. Diccionario de colores corporativos
  obtenerColorPorTurno(tipoTurno: string): string {
    switch(tipoTurno.toUpperCase()) {
      case 'MAÑANA': return '#2dd36f'; // Verde
      case 'TARDE': return '#ffc409'; // Naranja/Amarillo
      case 'NOCHE': return '#5260ff'; // Azul
      case 'LIBRE': return '#92949c'; // Gris
      case 'VACACIONES': return '#eb445a'; // Rojo
      default: return '#3880ff';
    }
  }

  // 3. Esta función salta cuando el usuario toca un día en el calendario
  diaSeleccionado(event: any) {
    // El calendario devuelve algo como "2026-03-01T00:00:00". Lo cortamos por la 'T' para quedarnos solo con la fecha.
    const fechaTocada = event.detail.value.split('T')[0];

    // Buscamos si en nuestra lista de turnos hay alguno para ese día
    const turnoEncontrado = this.turnos.find(t => t.fecha === fechaTocada);

    if (turnoEncontrado) {
      this.turnoElegido = turnoEncontrado;
      this.fechaElegidaNormal = fechaTocada; // Aquí más adelante podríamos formatearlo a "1 de Marzo"
    } else {
      // Si toca un día que no tiene turno asignado, ocultamos la tarjeta
      this.turnoElegido = null;
    }
  }
}
