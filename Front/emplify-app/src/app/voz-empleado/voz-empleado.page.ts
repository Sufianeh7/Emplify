import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import { chatbubblesOutline, chatbubbleOutline, add, sendOutline } from 'ionicons/icons';

@Component({
  selector: 'app-voz-empleado',
  templateUrl: './voz-empleado.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class VozEmpleadoPage implements OnInit {

  publicaciones: any[] = [];
  idEmpresa: number = 0;
  idEmpleado: number = 0;

  nuevoTitulo: string='';
  nuevoContenido: string='';

  constructor(private http: HttpClient) {
    addIcons({chatbubbleOutline, chatbubblesOutline, add, sendOutline})
  }

  ngOnInit() {
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      const empleado = JSON.parse(datos);
      // Guardamos IDs para las relaciones del modelo
      this.idEmpresa = empleado.empresa.idEmpresa;
      this.idEmpleado = empleado.idEmpleado;
      this.cargarMuro();
    }
  }

cargarMuro() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(`http://localhost:8080/api/voz-empleado/empresa/${this.idEmpresa}`, { headers })
      .subscribe((res: any) => {
        // Añadimos propiedades extra a cada post para controlar su propio cajón de comentarios
        this.publicaciones = res.map((pub: any) => ({
          ...pub,
          mostrarComentarios: false, // Controla si el acordeón está abierto
          comentarios: [],           // Guardará la lista de comentarios
          nuevoTexto: ''             // Lo que el usuario está escribiendo
        }));
      });
  }

publicar(modal: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    // Construimos el objeto respetando el modelo de Java
    const body = {
      titulo: this.nuevoTitulo,
      contenido: this.nuevoContenido,
      empleado: { idEmpleado: this.idEmpleado }, // Relación ManyToOne
      empresa: { idEmpresa: this.idEmpresa }     // Relación ManyToOne
    };

    this.http.post('http://localhost:8080/api/voz-empleado/publicar', body, { headers })
      .subscribe({
        next: (res) => {
          console.log('Publicado!', res);
          this.cargarMuro(); // Recargamos para ver nuestra publicación arriba
          this.nuevoTitulo = ''; // Limpiamos formulario
          this.nuevoContenido = '';
          modal.dismiss(); // Cerramos la ventana
        },
        error: (err) => console.error('Error al publicar', err)
      });
  }

// 1. Abre o cierra la zona de comentarios
  toggleComentarios(pub: any) {
    pub.mostrarComentarios = !pub.mostrarComentarios;
    // Si lo abrimos y aún no tiene comentarios cargados, los pedimos al servidor
    if (pub.mostrarComentarios && pub.comentarios.length === 0) {
      this.cargarComentarios(pub);
    }
  }

  // 2. Trae los comentarios de la base de datos
  cargarComentarios(pub: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(`http://localhost:8080/api/comentarios/publicacion/${pub.idPublicacion}`, { headers })
      .subscribe((res: any) => {
        pub.comentarios = res;
      });
  }

  // 3. Envía el comentario nuevo
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
          pub.comentarios.push(res); // Añadimos el comentario a la lista visualmente
          pub.nuevoTexto = '';       // Vaciamos el cajón de texto
        },
        error: (err) => console.error('Error al comentar', err)
      });
  }
}
