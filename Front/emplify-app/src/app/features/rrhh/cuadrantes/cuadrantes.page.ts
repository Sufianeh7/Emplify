import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import { calendarOutline, peopleOutline, saveOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cuadrantes',
  templateUrl: './cuadrantes.page.html',
  styleUrls: ['./cuadrantes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class CuadrantesPage {

  empleados: any[] = [];

  // Modelos del formulario interactivo
  empleadosSeleccionados: number[] = [];
  fechasSeleccionadas: string[] = [];
  tipoTurno: string = 'MAÑANA';

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({ calendarOutline, peopleOutline, saveOutline, timeOutline });
  }

  // Se ejecuta siempre que se entra a la vista. Garantiza que la lista de empleados está al día.
  ionViewWillEnter() {
    this.cargarEmpleados();
  }

  // Descarga la lista completa de empleados bajo la supervisión del usuario logueado
  cargarEmpleados() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/cuadrante/mis-empleados', { headers })
      .subscribe({
        next: (res: any) => this.empleados = res,
        error: (err) => console.error('Error cargando la lista de empleados', err)
      });
  }

  // Construye y envía el paquete de asignación masiva al Backend
  guardarCuadrante() {
    // Forzamos que siempre sea un array válido.
    let fechasArray = Array.isArray(this.fechasSeleccionadas)
      ? this.fechasSeleccionadas
      : [this.fechasSeleccionadas];

    // Limpiamos elementos vacíos por seguridad
    fechasArray = fechasArray.filter(f => f);

    // 2. Validación de campos obligatorios
    if (this.empleadosSeleccionados.length === 0 || fechasArray.length === 0) {
      this.mostrarToast('Selecciona al menos un empleado y una fecha', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    // 3. Transformamos la selección múltiple en una lista plana de asignaciones 1 a 1
    const peticiones: any[] = [];

    for (const idEmp of this.empleadosSeleccionados) {
      for (const fechaISO of fechasArray) {
        peticiones.push({
          empleado: { idEmpleado: idEmp },
          fecha: fechaISO.split('T')[0], // Extraemos solo el YYYY-MM-DD
          turno: this.tipoTurno
        });
      }
    }

    // 4. Enviamos el paquete masivo
    this.http.post('http://localhost:8080/api/cuadrante/asignar-masivo', peticiones, { headers })
      .subscribe({
        next: (res: any) => {
          const mensajeExito = res.mensaje || `¡${peticiones.length} turnos asignados con éxito!`;
          this.mostrarToast(mensajeExito, 'success');

          // Reseteamos el formulario tras guardar
          this.fechasSeleccionadas = [];
          this.empleadosSeleccionados = [];
        },
        error: (err) => {
          console.error('Error del backend al asignar turnos:', err);
          this.mostrarToast('Error al guardar en la base de datos', 'danger');
        }
      });
  }

  // Muestra mensajes en pantalla
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
