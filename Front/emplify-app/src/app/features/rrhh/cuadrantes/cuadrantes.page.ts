import { Component, OnInit } from '@angular/core';
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
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent] // <--- Añadido HeaderComponent
})
export class CuadrantesPage implements OnInit {

  empleados: any[] = [];

  // Variables para el formulario interactivo
  empleadosSeleccionados: number[] = [];
  fechasSeleccionadas: string[] = [];
  tipoTurno: string = 'MAÑANA';

  constructor(private http: HttpClient, private toastController: ToastController) {
    // Añadido timeOutline
    addIcons({ calendarOutline, peopleOutline, saveOutline, timeOutline });
  }

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/cuadrante/mis-empleados', { headers })
      .subscribe({
        next: (res: any) => this.empleados = res,
        error: (err) => console.error('Error cargando empleados', err)
      });
  }

guardarCuadrante() {
    // 1. BLINDAJE: Nos aseguramos de que siempre sea un Array (Ionic a veces devuelve un String)
    let fechasArray = Array.isArray(this.fechasSeleccionadas)
      ? this.fechasSeleccionadas
      : [this.fechasSeleccionadas];

    // Filtramos por si hay algún nulo o indefinido
    fechasArray = fechasArray.filter(f => f);

    if (this.empleadosSeleccionados.length === 0 || fechasArray.length === 0) {
      this.mostrarToast('Selecciona al menos un empleado y una fecha', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    // 2. Construimos las peticiones
    const peticiones: any[] = [];
    for (const idEmp of this.empleadosSeleccionados) {
      for (const fecha of fechasArray) {
        peticiones.push({
          empleado: { idEmpleado: idEmp },
          fecha: fecha.split('T')[0], // Cortamos la hora
          turno: this.tipoTurno
        });
      }
    }

    // 3. DEBUG: Mira la consola de tu navegador (F12) al guardar. ¡Deberías ver un array perfecto!
    console.log('📦 Peticiones a guardar:', peticiones);

    this.http.post('http://localhost:8080/api/cuadrante/asignar-masivo', peticiones, { headers })
      .subscribe({
        next: (res: any) => {
          const mensajeExito = res.mensaje ? res.mensaje : `¡${peticiones.length} turnos asignados con éxito!`;
          this.mostrarToast(mensajeExito, 'success');

          // Limpiamos
          this.fechasSeleccionadas = [];
          this.empleadosSeleccionados = [];
        },
        error: (err) => {
          console.error('❌ Error del backend:', err);
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
