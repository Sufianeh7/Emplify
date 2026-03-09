import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  homeOutline, calendarOutline, menuOutline, chevronForwardOutline,
  personCircleOutline, airplaneOutline, megaphoneOutline,
  chatbubblesOutline, peopleOutline, settingsOutline,
  briefcaseOutline, shieldCheckmarkOutline,
  headsetOutline
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

@Component({
  selector: 'app-mas',
  templateUrl: './mas.page.html',
  styleUrls: ['./mas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class MasPage implements OnInit {

  empleado: any = null;

  // Control de roles para mostrar el menú de administración
  esManager: boolean = false;
  esRRHH: boolean = false;
  esAdmin: boolean = false;

  constructor(private router: Router) {
    addIcons({
      homeOutline, calendarOutline, menuOutline, chevronForwardOutline,
      personCircleOutline, airplaneOutline, megaphoneOutline,
      chatbubblesOutline, peopleOutline, settingsOutline,
      briefcaseOutline, shieldCheckmarkOutline, headsetOutline
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      this.empleado = JSON.parse(datos);

      const rol = this.empleado?.usuario?.rol;
      this.esManager = (rol === 'MANAGER');
      this.esRRHH = (rol === 'RRHH' || rol === 'ADMIN');
      this.esAdmin = (rol === 'ADMIN');
    }
  }

  // --- NAVEGACIÓN GENERAL ---
  goTo(ruta: string) {
    this.router.navigate([ruta]);
  }

  // --- NAVEGACIÓN ESPECÍFICA CON PARÁMETROS ---
  goToAusencias() {
    this.router.navigate(['/cuadrante'], { queryParams: { tab: 'ausencias' } });
  }

}
