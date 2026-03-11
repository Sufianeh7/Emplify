import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  mailOutline, briefcaseOutline, logOutOutline, lockClosedOutline,
  closeOutline, personCircleOutline, locationOutline, calendarOutline,
  eyeOffOutline
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

  // Modelo del formulario de contraseña
  passActual: string = '';
  passNueva: string = '';
  passConfirmar: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      mailOutline, briefcaseOutline, logOutOutline, lockClosedOutline,
      closeOutline, personCircleOutline, locationOutline, calendarOutline,
      eyeOffOutline
    });
  }

  // Se ejecuta SIEMPRE que entramos a la vista
  ionViewWillEnter() {
    this.cargarDatosPerfil();
  }

  // Trae la información más reciente de la BBDD (Mánager actual, departamento...)
  cargarDatosPerfil() {
    // 1. Cargamos rápido del localStorage para pintar la vista al instante
    const datosLocal = localStorage.getItem('empleadoLogueado');
    if (datosLocal) {
      this.empleado = JSON.parse(datosLocal);
    }

    // 2. Hacemos la petición para actualizar los datos
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
      this.http.get('http://localhost:8080/api/empleados/perfil', { headers })
        .subscribe({
          next: (res: any) => {
            this.empleado = res;
            localStorage.setItem('empleadoLogueado', JSON.stringify(res)); // Mantenemos el local sincronizado
          },
          error: (err) => console.error('Error al actualizar datos del perfil desde BD', err)
        });
    }
  }

  // Método de cierre de sesión seguro
  cerrarSesion() {
    localStorage.clear();
    // Forzamos que se quite el foco del botón si estamos en móvil
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/home']);
  }

  // Utilidad de notificaciones
  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  // Proceso de cambio de credenciales
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
        next: () => {
          this.mostrarMensaje('¡Contraseña actualizada con éxito!', 'success');
          // Reseteamos el formulario y cerramos el modal
          this.passActual = '';
          this.passNueva = '';
          this.passConfirmar = '';
          modal.dismiss();
        },
        error: (err) => {
          this.mostrarMensaje(err.error?.error || 'Error al cambiar la contraseña', 'danger');
        }
      });
  }
}
