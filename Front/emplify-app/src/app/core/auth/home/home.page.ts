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
  cargando: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  login() {
    if (!this.usuario || !this.password) {
      this.mostrarMensaje('Por favor, rellena todos los campos.', 'warning');
      return;
    }

    this.cargando = true;

    // Codifica las credenciales en Base64 para Spring Security
    const token = btoa(this.usuario + ':' + this.password);
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token
    });

    this.http.get('http://localhost:8080/api/empleados/perfil', { headers }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', token);
        localStorage.setItem('empleadoLogueado', JSON.stringify(res));

        this.cargando = false;
        this.usuario = '';
        this.password = '';

        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error de login:', err);

        if (err.status === 401) {
          this.mostrarMensaje('Usuario o contraseña incorrectos.', 'danger');
        } else {
          this.mostrarMensaje('Error al conectar con el servidor.', 'danger');
        }
      }
    });
  }

  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    return await toast.present();
  }
}
