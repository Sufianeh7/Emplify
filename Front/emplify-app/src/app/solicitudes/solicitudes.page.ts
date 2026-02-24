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

  // Variables conectadas al formulario HTML
  tipoSeleccionado: number | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private http: HttpClient, private router: Router) {
    addIcons({sendOutline})
  }

  ngOnInit() {
    this.cargarTipos();
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
    // 1. Abrimos la "mochila" para coger los datos del empleado logueado
    const datosGuardados = localStorage.getItem('empleadoLogueado');
    const token = localStorage.getItem('token');

    if (datosGuardados && token) {
      const empleado = JSON.parse(datosGuardados);
      const idEmpleado = empleado[0].idEmpleado;

      // 2. Preparamos el paquete de datos exactamente igual que hicimos en Postman
      const paqueteDatos = {
        idEmpleado: idEmpleado,
        idTipo: this.tipoSeleccionado,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin
      };

      // 3. Preparamos la llave de seguridad
      const headers = new HttpHeaders({
        'Authorization': 'Basic ' + token,
        'Content-Type': 'application/json'
      });

      // 4. Hacemos el envío (POST)
      this.http.post('http://localhost:8080/api/solicitudes/nueva', paqueteDatos, { headers: headers })
        .subscribe({
          next: (respuesta: any) => {
            console.log('¡Solicitud guardada con éxito!', respuesta);
            alert('¡Tu solicitud ha sido enviada correctamente!'); // Mensaje para el usuario
            this.router.navigate(['/inicio']); // Le devolvemos a la pantalla principal
          },
          error: (error) => {
            console.error('Error al guardar la solicitud', error);
            alert('Hubo un error al enviar la petición.');
          }
        });
    }
  }

}
