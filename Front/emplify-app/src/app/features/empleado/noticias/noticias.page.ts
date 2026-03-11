import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline, newspaperOutline } from 'ionicons/icons';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.page.html',
  styleUrls: ['./noticias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderComponent]
})
export class NoticiasPage implements OnInit {
  noticias: any[] = [];

  constructor(private http: HttpClient) {
    addIcons({ chevronDownOutline, chevronUpOutline, newspaperOutline });
  }

  ngOnInit() {
    this.cargarNoticias();
  }

  cargarNoticias() {
    const empleado = JSON.parse(localStorage.getItem('empleadoLogueado') || '{}');
    const idEmpresa = empleado?.empresa?.idEmpresa;
    const token = localStorage.getItem('token');

    if (idEmpresa && token) {
      const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });
      this.http.get<any[]>(`http://localhost:8080/api/noticias/empresa/${idEmpresa}`, { headers })
        .subscribe(res => {
          // Añadimos una propiedad extra 'expandida' para controlar la vista en el HTML
          this.noticias = res.map(n => ({ ...n, expandida: false }));
        });
    }
  }

  toggleNoticia(noticia: any) {
    noticia.expandida = !noticia.expandida;
  }
}
