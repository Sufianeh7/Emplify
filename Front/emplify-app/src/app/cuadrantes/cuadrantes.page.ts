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

    // Reutilizamos tu endpoint existente para traer a los empleados
    this.http.get('http://localhost:8080/api/empleados/todos', { headers })
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
          idEmpleado: idEmp,
          fecha: fecha.split('T')[0], // Limpiamos la fecha por si Ionic añade la hora
          tipo: this.tipoTurno
        });
      }
    }

    // Enviamos el "paquete" al endpoint masivo que acabamos de crear en Spring Boot
    this.http.post('http://localhost:8080/api/turnos/asignar-masivo', peticiones, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast(`¡${peticiones.length} turnos asignados con éxito!`, 'success');
          // Limpiamos el formulario
          this.fechasSeleccionadas = [];
          this.empleadosSeleccionados = [];
        },
        error: (err) => {
          console.error('Error al guardar turnos', err);
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
