import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import {
  chatbubblesOutline, chatbubbleOutline, add, sendOutline,
  closeOutline, megaphoneOutline
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-voz-empleado',
  templateUrl: './voz-empleado.page.html',
  styleUrls: ['./voz-empleado.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class VozEmpleadoPage {

  publicaciones: any[] = [];
  idEmpresa: number = 0;
  idEmpleado: number = 0;
  nombreUsuarioActual: string = '';

  nuevoTitulo: string = '';
  nuevoContenido: string = '';

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      chatbubbleOutline, chatbubblesOutline, add, sendOutline,
      closeOutline, megaphoneOutline
    });
  }

  // Se ejecuta al entrar en la pestaña. Mantiene el muro siempre actualizado.
  ionViewWillEnter() {
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      const empleado = JSON.parse(datos);
      this.idEmpresa = empleado.empresa.id_empresa;
      this.idEmpleado = empleado.idEmpleado;
      this.nombreUsuarioActual = empleado.usuario?.nombre || 'Compañero/a';

      this.cargarMuro();
    }
  }

  // Descarga las publicaciones de la empresa
  cargarMuro() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(environment.apiUrl+`/voz-empleado/empresa/${this.idEmpresa}`, { headers })
      .subscribe({
        next: (res: any) => {
          this.publicaciones = res.map((pub: any) => ({
            ...pub,
            mostrarComentarios: false,
            comentarios: [],
            nuevoTexto: '',
            cargandoComentario: false // Bandera de seguridad para evitar spam de clics
          }));
        },
        error: (err) => console.error('Error al cargar el muro', err)
      });
  }

  // Envía un nuevo tema al tablón principal
  publicar(modal: any) {
    if (!this.nuevoTitulo || !this.nuevoContenido) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = {
      titulo: this.nuevoTitulo,
      contenido: this.nuevoContenido,
      empleado: { idEmpleado: this.idEmpleado },
      empresa: { idEmpresa: this.idEmpresa }
    };

    this.http.post(environment.apiUrl+'/voz-empleado/publicar', body, { headers })
      .subscribe({
        next: () => {
          this.mostrarMensaje('Publicado correctamente', 'success');
          this.cargarMuro();
          this.nuevoTitulo = '';
          this.nuevoContenido = '';
          modal.dismiss();
        },
        error: (err) => {
          console.error('Error al publicar', err);
          this.mostrarMensaje('Error al publicar', 'danger');
        }
      });
  }

  // Despliega/Oculta el hilo de respuestas de una publicación
  toggleComentarios(pub: any) {
    pub.mostrarComentarios = !pub.mostrarComentarios;

    // Si abrimos y está vacío, llamamos al backend
    if (pub.mostrarComentarios && pub.comentarios.length === 0) {
      this.cargarComentarios(pub);
    }
  }

  // Descarga el historial del chat de un post
  cargarComentarios(pub: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(environment.apiUrl+`/comentarios/publicacion/${pub.idPublicacion}`, { headers })
      .subscribe({
        next: (res: any) => pub.comentarios = res,
        error: (err) => console.error('Error al cargar comentarios', err)
      });
  }

  // Publica una respuesta dentro del hilo
  enviarComentario(pub: any) {
    if (!pub.nuevoTexto || pub.nuevoTexto.trim() === '') return;

    pub.cargandoComentario = true; // Desactiva el botón
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = {
      contenido: pub.nuevoTexto.trim(),
      vozEmpleado: { idPublicacion: pub.idPublicacion },
      empleado: { idEmpleado: this.idEmpleado }
    };

    this.http.post(environment.apiUrl+'/comentarios/nuevo', body, { headers })
      .subscribe({
        next: (res: any) => {
          // Inyectamos nuestro nombre localmente para no hacer otra petición a BBDD
          res.empleado = {
            ...res.empleado,
            usuario: { nombre: this.nombreUsuarioActual }
          };

          pub.comentarios.push(res);
          pub.nuevoTexto = '';
          pub.cargandoComentario = false;
        },
        error: (err) => {
          console.error('Error al comentar', err);
          this.mostrarMensaje('No se pudo enviar el comentario', 'danger');
          pub.cargandoComentario = false;
        }
      });

      this.cargarMuro()
  }

  // Utilidad de Toast
  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({ message: mensaje, duration: 2500, color, position: 'bottom' });
    toast.present();
  }
}
