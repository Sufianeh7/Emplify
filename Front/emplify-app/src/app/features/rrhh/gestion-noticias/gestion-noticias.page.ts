import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import {
  megaphoneOutline, imagesOutline, documentTextOutline,
  sendOutline, trashOutline, eyeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-gestion-noticias',
  templateUrl: './gestion-noticias.page.html',
  styleUrls: ['./gestion-noticias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class GestionNoticiasPage implements OnInit {

  seccionActual: string = 'carrusel';
  idEmpresaLogueada: number = 0;

  nuevaNoticia: any = { titulo: '', subtitulo: '',contenido: '' ,imagenUrl: '', tipoFondo: 'blue-bg' };
  nuevaPublicacion: any = { titulo: '', contenido: '' };

  listaNoticias: any[] = [];
  listaMuro: any[] = [];

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({ megaphoneOutline, imagesOutline, documentTextOutline, sendOutline, trashOutline, eyeOutline });
  }

  ngOnInit() {
    const empleado = JSON.parse(localStorage.getItem('empleadoLogueado') || '{}');
    this.idEmpresaLogueada = empleado?.empresa?.idEmpresa;
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarNoticias();
    this.cargarMuro();
  }

  cargarNoticias() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
    this.http.get<any[]>(`http://localhost:8080/api/noticias/empresa/${this.idEmpresaLogueada}`, { headers })
      .subscribe(res => this.listaNoticias = res);
  }

  cargarMuro() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
    this.http.get<any[]>(`http://localhost:8080/api/voz-empleado/empresa/${this.idEmpresaLogueada}`, { headers })
      .subscribe(res => this.listaMuro = res);
  }

  publicarNoticia() {
    if (!this.nuevaNoticia.titulo) {
      this.mostrarToast('El título es obligatorio', 'warning');
      return; // El compilador a veces se queja aquí, pero con el cambio de abajo debería bastar
    }

    this.nuevaNoticia.tipoFondo = this.nuevaNoticia.imagenUrl ? 'image-bg' : 'blue-bg';
    const body = { ...this.nuevaNoticia, empresa: { idEmpresa: this.idEmpresaLogueada } };
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.post('http://localhost:8080/api/noticias/publicar', body, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Noticia publicada en el carrusel', 'success');
        this.nuevaNoticia = { titulo: '', subtitulo: '', imagenUrl: '', tipoFondo: 'blue-bg' };
        this.cargarNoticias();
      }
    });
  }

  publicarMuro() {
    if (!this.nuevaPublicacion.titulo || !this.nuevaPublicacion.contenido) {
      this.mostrarToast('Título y contenido son obligatorios', 'warning');
      return;
    }

    const body = { ...this.nuevaPublicacion, empresa: { idEmpresa: this.idEmpresaLogueada } };
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.post('http://localhost:8080/api/voz-empleado/publicar', body, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Comunicado publicado en el muro', 'success');
        this.nuevaPublicacion = { titulo: '', contenido: '' };
        this.cargarMuro();
      }
    });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    return await toast.present(); // Devolvemos la promesa para evitar el error TS7030
  }
}
