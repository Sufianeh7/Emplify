import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import { chatbubblesOutline, chatbubbleOutline, add } from 'ionicons/icons';

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
    addIcons({chatbubbleOutline, chatbubblesOutline, add})
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
      .subscribe((res: any) => this.publicaciones = res);
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
}
