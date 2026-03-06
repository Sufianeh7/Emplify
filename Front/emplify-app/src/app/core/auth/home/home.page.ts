import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage {

  usuario: string = '';
  password: string = '';
  mostrarPassword: boolean = false;
  cargando: boolean = false; // Controla la animación del botón

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    // Registramos los iconos del ojito
    addIcons({ eyeOutline, eyeOffOutline });
  }

  // Cambia el estado para ver/ocultar la contraseña
  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  login() {
    // 1. Validar que no estén vacíos
    if (!this.usuario || !this.password) {
      this.mostrarMensaje('Por favor, rellena todos los campos.', 'warning');
      return;
    }

    this.cargando = true; // Empieza a girar el botón

    // 2. Crear el token Basic Auth (usuario:contraseña codificado en Base64)
    const token = btoa(this.usuario + ':' + this.password);
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token
    });

    // 3. Llamada a tu API real
    // ⚠️ ATENCIÓN: Asegúrate de que esta sea la URL correcta de tu backend para el login
    this.http.get('http://localhost:8080/api/empleados/perfil', { headers }).subscribe({
      next: (res: any) => {
        // ¡Éxito! Guardamos el token y los datos del empleado
        localStorage.setItem('token', token);
        localStorage.setItem('empleadoLogueado', JSON.stringify(res));

        this.cargando = false;

        // Limpiamos los campos por seguridad
        this.usuario = '';
        this.password = '';

        // Navegamos a nuestra ruta limpia
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error de login:', err);

        // Si el backend devuelve un 401 (No autorizado) u otro error
        if (err.status === 401) {
          this.mostrarMensaje('Usuario o contraseña incorrectos.', 'danger');
        } else {
          this.mostrarMensaje('Error al conectar con el servidor.', 'danger');
        }
      }
    });
  }

  // Utilidad para mostrar alertas abajo en la pantalla
  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
