import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular'; // <-- Importa ToastController
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <-- Importa HttpClient
import { addIcons } from 'ionicons';
import { mailOutline, businessOutline, briefcaseOutline, logOutOutline, lockClosedOutline } from 'ionicons/icons'; // <-- Añade lockClosedOutline

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PerfilPage {

  empleado: any = null;

  // Variables para el cambio de contraseña
  passActual: string = '';
  passNueva: string = '';
  passConfirmar: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController // <-- Inyéctalo aquí
  ) {
    addIcons({ mailOutline, businessOutline, briefcaseOutline, logOutOutline, lockClosedOutline });
  }

  ionViewWillEnter() {
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      this.empleado = JSON.parse(datos);
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/home']);
  }

  // Función para mostrar mensajes flotantes
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
    // 1. Validar que las contraseñas nuevas coincidan
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

    // 2. Enviar petición al Backend
    this.http.put('http://localhost:8080/api/usuarios/cambiar-password', body, { headers })
      .subscribe({
        next: (res: any) => {
          this.mostrarMensaje('¡Contraseña actualizada con éxito!', 'success');
          // Limpiar formulario y cerrar modal
          this.passActual = ''; this.passNueva = ''; this.passConfirmar = '';
          modal.dismiss();

          // Opcional: Cerrar sesión para obligarle a entrar con la nueva
          // this.cerrarSesion();
        },
        error: (err) => {
          // Si el servidor devuelve error (ej. contraseña actual mal)
          this.mostrarMensaje(err.error.error || 'Error al cambiar la contraseña', 'danger');
        }
      });
  }
}
