import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import { timeOutline, searchOutline, logInOutline, logOutOutline, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-control-fichaje',
  templateUrl: './control-fichajes.page.html',
  styleUrls: ['./control-fichajes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class ControlFichajesPage implements OnInit {

  empleados: any[] = [];
  empleadoSeleccionado: any = null;
  historialFichajes: any[] = [];
  totalHorasCalculadas: string = '0.00';

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({ timeOutline, searchOutline, logInOutline, logOutOutline, documentTextOutline });
  }

  ngOnInit() {
    this.cargarEmpleados();
  }

  // Reutilizamos el endpoint de cuadrantes para traer a los empleados de la empresa
  cargarEmpleados() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/cuadrante/mis-empleados', { headers })
      .subscribe({
        next: (res: any) => this.empleados = res,
        error: (err) => console.error('Error cargando empleados', err)
      });
  }

  buscarHistorial(event: any) {
    const idEmpleado = event.detail.value;
    if (!idEmpleado) return;

    this.empleadoSeleccionado = this.empleados.find(e => e.idEmpleado === idEmpleado);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    // Llamamos al endpoint que creamos en el paso anterior
    this.http.get(`http://localhost:8080/api/fichajes/historial/${idEmpleado}`, { headers })
      .subscribe({
        next: (res: any) => {
          this.historialFichajes = res.sort((a: any, b: any) =>
            new Date(b.horaEntrada).getTime() - new Date(a.horaEntrada).getTime() // Ordenamos del más reciente al más antiguo
          );
          this.calcularTotalHoras();
        },
        error: (err) => this.mostrarToast('Error al obtener el historial', 'danger')
      });
  }

  calcularTotalHoras() {
    let totalMs = 0;
    this.historialFichajes.forEach(fichaje => {
      if (fichaje.horaEntrada && fichaje.horaSalida) {
        const entrada = new Date(fichaje.horaEntrada).getTime();
        const salida = new Date(fichaje.horaSalida).getTime();
        totalMs += (salida - entrada);
      }
    });
    // Convertimos milisegundos a horas decimales (ej: 8.5 horas)
    this.totalHorasCalculadas = (totalMs / (1000 * 60 * 60)).toFixed(2);
  }

  calcularHorasTurno(entradaStr: string, salidaStr: string): string {
    if (!salidaStr) return 'En curso...';
    const entrada = new Date(entradaStr).getTime();
    const salida = new Date(salidaStr).getTime();
    const horas = ((salida - entrada) / (1000 * 60 * 60)).toFixed(2);
    return `${horas} h`;
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje, duration: 3000, color: color, position: 'bottom'
    });
    toast.present();
  }
}
