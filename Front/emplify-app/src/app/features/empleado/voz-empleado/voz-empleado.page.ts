import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  chatbubblesOutline, chatbubbleOutline, add, sendOutline,
  closeOutline, homeOutline, calendarOutline, menuOutline, megaphoneOutline
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

@Component({
  selector: 'app-voz-empleado',
  templateUrl: './voz-empleado.page.html',
  styleUrls: ['./voz-empleado.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class VozEmpleadoPage implements OnInit {

  publicaciones: any[] = [];
  idEmpresa: number = 0;
  idEmpleado: number = 0;

  // NUEVO: Variable para guardar el nombre del usuario logueado
  nombreUsuarioActual: string = '';

  nuevoTitulo: string = '';
  nuevoContenido: string = '';

  constructor(private http: HttpClient, private router: Router) {
    addIcons({
      chatbubbleOutline, chatbubblesOutline, add, sendOutline,
      closeOutline, homeOutline, calendarOutline, menuOutline, megaphoneOutline
    });
  }

  ngOnInit() {
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      const empleado = JSON.parse(datos);
      this.idEmpresa = empleado.empresa.idEmpresa;
      this.idEmpleado = empleado.idEmpleado;

      // NUEVO: Guardamos el nombre del usuario al entrar a la página
      this.nombreUsuarioActual = empleado.usuario?.nombre || 'Compañero/a';

      this.cargarMuro();
    }
  }

  cargarMuro() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(`http://localhost:8080/api/voz-empleado/empresa/${this.idEmpresa}`, { headers })
      .subscribe((res: any) => {
        this.publicaciones = res.map((pub: any) => ({
          ...pub,
          mostrarComentarios: false,
          comentarios: [],
          nuevoTexto: ''
        }));
      });
  }

  publicar(modal: any) {
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

    this.http.post('http://localhost:8080/api/voz-empleado/publicar', body, { headers })
      .subscribe({
        next: (res) => {
          this.cargarMuro();
          this.nuevoTitulo = '';
          this.nuevoContenido = '';
          modal.dismiss();
        },
        error: (err) => console.error('Error al publicar', err)
      });
  }

  toggleComentarios(pub: any) {
    pub.mostrarComentarios = !pub.mostrarComentarios;
    if (pub.mostrarComentarios && pub.comentarios.length === 0) {
      this.cargarComentarios(pub);
    }
  }

  cargarComentarios(pub: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(`http://localhost:8080/api/comentarios/publicacion/${pub.idPublicacion}`, { headers })
      .subscribe((res: any) => {
        pub.comentarios = res;
      });
  }

  enviarComentario(pub: any) {
    if (!pub.nuevoTexto || pub.nuevoTexto.trim() === '') return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = {
      contenido: pub.nuevoTexto,
      vozEmpleado: { idPublicacion: pub.idPublicacion },
      empleado: { idEmpleado: this.idEmpleado }
    };

    this.http.post('http://localhost:8080/api/comentarios/nuevo', body, { headers })
      .subscribe({
        next: (res: any) => {
          // --- NUEVO: Magia para inyectar el nombre sin recargar ---
          res.empleado = {
            ...res.empleado,
            usuario: { nombre: this.nombreUsuarioActual }
          };

          pub.comentarios.push(res);
          pub.nuevoTexto = '';
        },
        error: (err) => console.error('Error al comentar', err)
      });
  }

  goTo(ruta: string) {
    this.router.navigate([ruta]);
  }
}
