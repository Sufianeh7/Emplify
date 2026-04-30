import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import {
  megaphoneOutline,
  imagesOutline,
  documentTextOutline,
  sendOutline,
} from 'ionicons/icons';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-gestion-noticias',
  templateUrl: './gestion-noticias.page.html',
  styleUrls: ['./gestion-noticias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent],
})
export class GestionNoticiasPage {
  seccionActual: string = 'carrusel';
  idEmpresaLogueada: number = 0;

  // Modelos de los formularios
  nuevaNoticia: any = {
    titulo: '',
    subtitulo: '',
    contenido: '',
    imagenUrl: '',
    tipoFondo: 'blue-bg',
  };
  nuevaPublicacion: any = { titulo: '', contenido: '' };

  // Listados de histórico
  listaNoticias: any[] = [];
  listaMuro: any[] = [];

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
  ) {
    addIcons({
      megaphoneOutline,
      imagesOutline,
      documentTextOutline,
      sendOutline,
    });
  }

  // Asegura la carga de datos cada vez que se entra a la vista
  ionViewWillEnter() {
    const empleado = JSON.parse(
      localStorage.getItem('empleadoLogueado') || '{}',
    );
    this.idEmpresaLogueada = empleado?.empresa?.id_empresa;

    if (this.idEmpresaLogueada) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    this.cargarNoticias();
    this.cargarMuro();
  }

  cargarNoticias() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    this.http
      .get<
        any[]
      >(environment.apiUrl + `/noticias/empresa/${this.idEmpresaLogueada}`, { headers })
      .subscribe({
        next: (res) => (this.listaNoticias = res),
        error: (err) => console.error('Error cargando noticias', err),
      });
  }

  publicarNoticia() {
    if (!this.nuevaNoticia.titulo) return;

    // Lógica para decidir el estilo de la tarjeta (con o sin imagen de fondo)
    this.nuevaNoticia.tipoFondo = this.nuevaNoticia.imagenUrl
      ? 'image-bg'
      : 'blue-bg';

    const body = {
      ...this.nuevaNoticia,
      empresa: { idEmpresa: this.idEmpresaLogueada },
    };
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    this.http
      .post(environment.apiUrl + '/noticias/publicar', body, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast('Noticia publicada en el carrusel', 'success');
          // Reseteamos el formulario
          this.nuevaNoticia = {
            titulo: '',
            subtitulo: '',
            contenido: '',
            imagenUrl: '',
            tipoFondo: 'blue-bg',
          };
          this.cargarNoticias(); // Refrescamos el listado
        },
        error: (err) =>
          this.mostrarToast('Error al publicar noticia', 'danger'),
      });
  }

  cargarMuro() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    this.http
      .get<
        any[]
      >(environment.apiUrl + `/voz-empleado/empresa/${this.idEmpresaLogueada}`, { headers })
      .subscribe({
        next: (res) => (this.listaMuro = res),
        error: (err) => console.error('Error cargando el muro', err),
      });
  }

  publicarMuro() {
    if (!this.nuevaPublicacion.titulo || !this.nuevaPublicacion.contenido)
      return;

    // Se asigna también al empleado activo internamente en el backend si el controlador lo requiere.
    const body = {
      ...this.nuevaPublicacion,
      empresa: { idEmpresa: this.idEmpresaLogueada },
    };
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    this.http
      .post(environment.apiUrl + '/voz-empleado/publicar', body, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast('Comunicado publicado en el muro', 'success');
          // Reseteamos formulario
          this.nuevaPublicacion = { titulo: '', contenido: '' };
          this.cargarMuro(); // Refrescamos listado
        },
        error: (err) =>
          this.mostrarToast('Error al publicar comunicado', 'danger'),
      });
  }

  // Notificaciones
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    return await toast.present();
  }
}
