import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline, newspaperOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.page.html',
  styleUrls: ['./noticias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderComponent]
})
export class NoticiasPage {

  noticias: any[] = [];

  constructor(private http: HttpClient) {
    addIcons({ chevronDownOutline, chevronUpOutline, newspaperOutline });
  }

  // Se ejecuta SIEMPRE que se entra en la vista (refresca los datos)
  ionViewWillEnter() {
    this.cargarNoticias();
  }

  // Descarga las noticias de la empresa logueada
  cargarNoticias() {
    const empleado = JSON.parse(localStorage.getItem('empleadoLogueado') || '{}');
    const idEmpresa = empleado?.empresa?.id_empresa;
    const token = localStorage.getItem('token');

    if (idEmpresa && token) {
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

      this.http.get<any[]>(environment.apiUrl+`/noticias/empresa/${idEmpresa}`, { headers })
        .subscribe({
          next: (res) => {
            // Añadimos 'expandida' en false por defecto para controlar el acordeón del HTML
            this.noticias = res.map(n => ({ ...n, expandida: false }));
          },
          error: (err) => console.error('Error al cargar noticias corporativas:', err)
        });
    }
  }

  // Alterna el estado de abrir/cerrar de una noticia concreta
  toggleNoticia(noticia: any) {
    noticia.expandida = !noticia.expandida;
  }
}
