import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import { sendOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SolicitudesPage implements OnInit {

  tiposSolicitud: any[] = []; // Guardará: Vacaciones, Asuntos Propios...
  misSolicitudes: any[] = []; // Para guardar el historial
  turnosCuadrante: any[] = []; // Para guardar los días de trabajo

  // Variables conectadas al formulario HTML
  tipoSeleccionado: number | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private http: HttpClient, private router: Router) {
    addIcons({sendOutline})
  }

  ngOnInit() {
    this.cargarTipos();
    this.cargarHistorial();
    this.cargarCuadrante();
  }

  cargarTipos() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

      this.http.get('http://localhost:8080/api/solicitudes/tipos', { headers })
        .subscribe({
          next: (respuesta: any) => {
            console.log('Tipos cargados:', respuesta);
            this.tiposSolicitud = respuesta;
          },
          error: (error) => console.error('Error al cargar tipos', error)
        });
    }
  }

  enviarSolicitud() {
    // --- 1. VALIDACIÓN INTELIGENTE (Lo primero de todo) ---
    // Si la función de validarFechas detecta un día libre, corta la ejecución aquí
    if (!this.validarFechas()) {
      return;
    }

    // 2. Si pasa la validación, cogemos los datos para el envío
    const datosGuardados = localStorage.getItem('empleadoLogueado');
    const token = localStorage.getItem('token');

    if (datosGuardados && token) {
      const empleado = JSON.parse(datosGuardados);
      const idEmpleado = empleado[0].idEmpleado;

      // 3. Preparamos el paquete de datos
      const paqueteDatos = {
        idEmpleado: idEmpleado,
        idTipo: this.tipoSeleccionado,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin
      };

      // 4. Preparamos las cabeceras
      const headers = new HttpHeaders({
        'Authorization': 'Basic ' + token,
        'Content-Type': 'application/json'
      });

      // 5. Hacemos el envío (POST)
      this.http.post('http://localhost:8080/api/solicitudes/nueva', paqueteDatos, { headers: headers })
        .subscribe({
          next: (respuesta: any) => {
            console.log('¡Solicitud guardada con éxito!', respuesta);
            alert('¡Tu solicitud ha sido enviada correctamente!');
            this.router.navigate(['/inicio']);
          },
          error: (error) => {
            console.error('Error al guardar la solicitud', error);
            alert('Hubo un error al enviar la petición.');
          }
        });
    }
  }

  cargarHistorial(){
    const datosGuardados = localStorage.getItem('empleadoLogueado');
    const token = localStorage.getItem('token');

    if(datosGuardados && token) {
      const empleado = JSON.parse(datosGuardados);
      const idEmpleado = empleado.idEmpleado;
      const headers = new HttpHeaders({'Authorization': 'Basic ' + token});

      this.http.get(`http://localhost:8080/api/solicitudes/empleado/${idEmpleado}`, { headers })
        .subscribe({
          next: (respuesta: any) => {
            this.misSolicitudes = respuesta;
          },
          error: (error) => console.error('Error al cargar historial', error)
        });
    }
  }

  cargarCuadrante() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');
    const token = localStorage.getItem('token');
    if (datosGuardados && token) {
      const empleado = JSON.parse(datosGuardados);
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
      this.http.get(`http://localhost:8080/api/cuadrante/empleado/${empleado.idEmpleado}`, { headers })
        .subscribe(res => { this.turnosCuadrante = res as any[]; });
    }
  }

  validarFechas(): boolean {
    // 1. Buscamos si alguno de los días en el rango elegido es "LIBRE" en el cuadrante
    const hayDiasLibres = this.turnosCuadrante.some(turno => {
      return turno.fecha >= this.fechaInicio &&
            turno.fecha <= this.fechaFin &&
            turno.turno.toUpperCase() === 'LIBRE';
    });

    if (hayDiasLibres) {
      alert('Atención: Has seleccionado un rango que incluye días en los que ya estás LIBRE. Por favor, ajusta las fechas.');
      return false;
    }
    return true;
  }

}
