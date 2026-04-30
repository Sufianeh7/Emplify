import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chatboxEllipsesOutline,
  personCircleOutline,
  notificationsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule], // Necesario para que funcionen las etiquetas <ion-...>
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router) {
    // Registramos los iconos que usa este componente
    addIcons({
      chatboxEllipsesOutline,
      personCircleOutline,
      notificationsOutline,
    });
  }

  ngOnInit() {}

  goTickets() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['tickets']);
  }

  goPerfil() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['perfil']);
  }

  goInicio() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['inicio']);
  }
}
