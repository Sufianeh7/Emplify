import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chatboxEllipsesOutline, personCircleOutline, notificationsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule] // Necesario para que funcionen las etiquetas <ion-...>
})
export class HeaderComponent implements OnInit {

  constructor() {
    // Registramos los iconos que usa este componente
    addIcons({ chatboxEllipsesOutline, personCircleOutline, notificationsOutline });
  }

  ngOnInit() {}

}
