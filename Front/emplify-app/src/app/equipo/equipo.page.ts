import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline, calendarOutline } from 'ionicons/icons';

@Component({
  selector: 'app-equipo',
  templateUrl: './equipo.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EquipoPage {

  solicitudes: any[] = [];

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({ checkmarkOutline, closeOutline, calendarOutline });
  }

  ionViewWillEnter() {
    this.cargarSolicitudes();
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
          this.cargarSolicitudes(); // Recargamos la lista para que desaparezca la que acabamos de gestionar
        },
        error: (err) => console.error('Error al cambiar estado', err)
      });
  }
}
