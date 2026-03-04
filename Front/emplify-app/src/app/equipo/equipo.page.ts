import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline, calendarOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-equipo',
  templateUrl: './equipo.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EquipoPage {

  solicitudes: any[] = [];
  miEquipo: any[] = []; // NUEVO: Array para guardar a los empleados y sus saldos

  constructor(private http: HttpClient, private toastController: ToastController) {
    // Añadido el icono de persona para la lista de equipo
    addIcons({ checkmarkOutline, closeOutline, calendarOutline, personCircleOutline });
  }

  ionViewWillEnter() {
    this.cargarSolicitudes();
    this.cargarEquipo(); // NUEVO: Cargamos los saldos al entrar a la vista
  }

  cargarSolicitudes() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/solicitudes/equipo/pendientes', { headers })
      .subscribe({
        next: (res: any) => this.solicitudes = res,
        error: (err) => console.error('Error al cargar peticiones del equipo', err)
      });
  }

  // NUEVO: Método para obtener los empleados a cargo y sus días disponibles
  cargarEquipo() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/empleados/mi-equipo', { headers })
      .subscribe({
        next: (res: any) => this.miEquipo = res,
        error: (err) => console.error('Error al cargar datos del equipo', err)
      });
  }

  async cambiarEstado(idSolicitud: number, nuevoEstado: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = { estado: nuevoEstado };

    this.http.put(`http://localhost:8080/api/solicitudes/${idSolicitud}/estado`, body, { headers })
      .subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: `Solicitud ${nuevoEstado.toLowerCase()} con éxito`,
            duration: 2000,
            color: nuevoEstado === 'APROBADA' ? 'success' : 'danger',
            position: 'bottom'
          });
          toast.present();
          this.cargarSolicitudes(); // Recargamos las peticiones pendientes

          // Si aprobamos, recargamos el equipo para que se actualicen los días restados
          if (nuevoEstado === 'APROBADA') {
            this.cargarEquipo();
          }
        },
        error: (err) => {
          // Mejoramos el manejo de errores por si el backend rechaza por falta de días
          const msg = err.error?.error || 'Error al cambiar estado';
          this.toastController.create({
            message: msg,
            duration: 3000,
            color: 'danger',
            position: 'bottom'
          }).then(t => t.present());
        }
      });
  }
}
