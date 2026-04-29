import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline, closeOutline, calendarOutline,
  personCircleOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-mi-equipo',
  templateUrl: './gestion-equipo.page.html',
  styleUrls: ['./gestion-equipo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class GestionEquipoPage {

  segmentoActual: string = 'peticiones';

  solicitudes: any[] = [];
  miEquipo: any[] = [];

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      checkmarkOutline, closeOutline, calendarOutline,
      personCircleOutline, checkmarkCircleOutline
    });
  }

  // Refresca la información automáticamente al entrar a la vista
  ionViewWillEnter() {
    this.cargarSolicitudes();
    this.cargarEquipo();
  }

  // Saca la primera letra para el avatar
  getInicial(nombre: string): string {
    if (!nombre) return '?';
    return nombre.charAt(0).toUpperCase();
  }

  // --- 1. CARGA DE DATOS ---
  // Obtiene las ausencias que requieren revisión por parte de este mánager
  cargarSolicitudes() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(environment.apiUrl+'/api/solicitudes/equipo/pendientes', { headers })
      .subscribe({
        next: (res: any) => this.solicitudes = res,
        error: (err) => console.error('Error al cargar peticiones', err)
      });
  }

  // Obtiene la lista de personas que reportan a este mánager (y su saldo de días)
  cargarEquipo() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(environment.apiUrl+'/api/empleados/mi-equipo', { headers })
      .subscribe({
        next: (res: any) => this.miEquipo = res,
        error: (err) => console.error('Error al cargar el directorio del equipo', err)
      });
  }

  // --- 2. ACCIONES DEL MÁNAGER ---
  // Aprueba o rechaza una solicitud de ausencia
  async cambiarEstado(idSolicitud: number, nuevoEstado: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = { estado: nuevoEstado };

    this.http.put(environment.apiUrl+`/api/solicitudes/${idSolicitud}/estado`, body, { headers })
      .subscribe({
        next: async () => {
          this.mostrarToast(
            `Solicitud ${nuevoEstado.toLowerCase()} con éxito`,
            nuevoEstado === 'APROBADA' ? 'success' : 'danger'
          );

          // Refrescamos la lista de peticiones para que desaparezca la que acabamos de revisar
          this.cargarSolicitudes();

          // Si la aprobamos, se habrán consumido días, así que refrescamos el saldo del equipo
          if (nuevoEstado === 'APROBADA') {
            this.cargarEquipo();
          }
        },
        error: (err) => {
          const msg = err.error?.error || 'Error al cambiar el estado de la solicitud';
          this.mostrarToast(msg, 'danger');
        }
      });
  }

  // Notificaciones
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
