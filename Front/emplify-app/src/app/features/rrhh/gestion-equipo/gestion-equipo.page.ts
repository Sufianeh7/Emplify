import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline, closeOutline, calendarOutline,
  personCircleOutline, homeOutline, menuOutline,
  checkmarkCircleOutline, closeCircleOutline
} from 'ionicons/icons';

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
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({
      checkmarkOutline, closeOutline, calendarOutline,
      personCircleOutline, homeOutline, menuOutline,
      checkmarkCircleOutline, closeCircleOutline
    });
  }

  ionViewWillEnter() {
    this.cargarSolicitudes();
    this.cargarEquipo();
  }

  getInicial(nombre: string): string {
    if (!nombre) return '?';
    return nombre.charAt(0).toUpperCase();
  }

  cargarSolicitudes() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/solicitudes/equipo/pendientes', { headers })
      .subscribe({
        next: (res: any) => this.solicitudes = res,
        error: (err) => console.error('Error al cargar peticiones', err)
      });
  }

  cargarEquipo() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/empleados/mi-equipo', { headers })
      .subscribe({
        next: (res: any) => this.miEquipo = res,
        error: (err) => console.error('Error al cargar equipo', err)
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
          this.mostrarToast(`Solicitud ${nuevoEstado.toLowerCase()} con éxito`, nuevoEstado === 'APROBADA' ? 'success' : 'danger');
          this.cargarSolicitudes();

          if (nuevoEstado === 'APROBADA') {
            this.cargarEquipo();
          }
        },
        error: (err) => {
          const msg = err.error?.error || 'Error al cambiar estado';
          this.mostrarToast(msg, 'danger');
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

  goTo(ruta: string) {
    this.router.navigate([ruta]);
  }
}
