import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  mailOutline, businessOutline, briefcaseOutline, logOutOutline,
  lockClosedOutline, closeOutline, personCircleOutline, locationOutline,
  calendarOutline, idCardOutline, eyeOffOutline,
  homeOutline, menuOutline
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class PerfilPage {

  empleado: any = null;

  passActual: string = '';
  passNueva: string = '';
  passConfirmar: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      mailOutline, businessOutline, briefcaseOutline, logOutOutline,
      lockClosedOutline, closeOutline, personCircleOutline, locationOutline,
      calendarOutline, idCardOutline, eyeOffOutline,
      homeOutline, menuOutline
    });
  }

  ionViewWillEnter() {
    this.cargarDatosPerfil();
  }

  // --- NUEVO: Traemos los datos frescos de la BBDD ---
  cargarDatosPerfil() {
    // 1. Cargamos rápido del localStorage para que no se vea la pantalla vacía de golpe
    const datosLocal = localStorage.getItem('empleadoLogueado');
    if (datosLocal) {
      this.empleado = JSON.parse(datosLocal);
    }

    // 2. Llamamos a la BD para traer la info actualizada (Manager, departamento, etc.)
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
      this.http.get('http://localhost:8080/api/empleados/perfil', { headers })
        .subscribe({
          next: (res: any) => {
            this.empleado = res; // Sobrescribimos con los datos frescos
            // Opcional: Actualizamos el localStorage por si va a otras pantallas
            localStorage.setItem('empleadoLogueado', JSON.stringify(res));
          },
          error: (err) => console.error('Error al cargar datos del perfil desde BD', err)
        });
    }
  }

  goTo(ruta: string) {
    this.router.navigate([ruta]);
  }

  cerrarSesion() {
    localStorage.clear();
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/home']);
  }

  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  cambiarPassword(modal: any) {
    if (this.passNueva !== this.passConfirmar) {
      this.mostrarMensaje('Las contraseñas nuevas no coinciden', 'danger');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = {
      actual: this.passActual,
      nueva: this.passNueva
    };

    this.http.put('http://localhost:8080/api/usuarios/cambiar-password', body, { headers })
      .subscribe({
        next: (res: any) => {
          this.mostrarMensaje('¡Contraseña actualizada con éxito!', 'success');
          this.passActual = ''; this.passNueva = ''; this.passConfirmar = '';
          modal.dismiss();
        },
        error: (err) => {
          this.mostrarMensaje(err.error.error || 'Error al cambiar la contraseña', 'danger');
        }
      });
  }
}
