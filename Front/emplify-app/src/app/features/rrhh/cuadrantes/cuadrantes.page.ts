import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { calendarOutline, peopleOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cuadrantes',
  templateUrl: './cuadrantes.page.html',
  styleUrls: ['./cuadrantes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CuadrantesPage implements OnInit {

  empleados: any[] = [];

  // Variables para el formulario interactivo
  empleadosSeleccionados: number[] = []; // IDs de los empleados elegidos
  fechasSeleccionadas: string[] = [];    // Días marcados en el calendario (formato YYYY-MM-DD)
  tipoTurno: string = 'MAÑANA';          // Por defecto

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({ calendarOutline, peopleOutline, saveOutline });
  }

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    // Endpoint blindado. Solo carga empleados de la empresa del RRHH/Manager
    this.http.get('http://localhost:8080/api/cuadrante/mis-empleados', { headers })
      .subscribe({
        next: (res: any) => this.empleados = res,
        error: (err) => console.error('Error cargando empleados', err)
      });
  }

  guardarCuadrante() {
    if (this.empleadosSeleccionados.length === 0 || this.fechasSeleccionadas.length === 0) {
      this.mostrarToast('Selecciona al menos un empleado y una fecha', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    // Construimos la lista gigante de DTOs multiplicando empleados x fechas
    const peticiones = [];
    for (const idEmp of this.empleadosSeleccionados) {
      for (const fecha of this.fechasSeleccionadas) {
        peticiones.push({
          empleado: { idEmpleado: idEmp },
          fecha: fecha.split('T')[0], // Limpiamos la fecha por si Ionic añade la hora
          turno: this.tipoTurno // <--- SOLUCIÓN: Cambiado 'tipo' por 'turno'
        });
      }
    }

    // Llamamos al nuevo endpoint de CuadranteControlador que lo guarda todo de golpe
    this.http.post('http://localhost:8080/api/cuadrante/asignar-masivo', peticiones, { headers })
      .subscribe({
        next: (res: any) => {
          // Usamos el mensaje que nos devuelve el backend o uno por defecto
          const mensajeExito = res.mensaje ? res.mensaje : `¡${peticiones.length} turnos asignados con éxito!`;
          this.mostrarToast(mensajeExito, 'success');

          // Limpiamos el formulario
          this.fechasSeleccionadas = [];
          this.empleadosSeleccionados = [];
        },
        error: (err) => {
          console.error('Error al guardar turnos masivos', err);
          this.mostrarToast('Error al guardar en la base de datos', 'danger');
        }
      });
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
}
