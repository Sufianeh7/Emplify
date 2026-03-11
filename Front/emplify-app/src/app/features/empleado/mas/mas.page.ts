import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  calendarOutline, chevronForwardOutline, airplaneOutline, megaphoneOutline,
  chatbubblesOutline, peopleOutline, briefcaseOutline, shieldCheckmarkOutline,
  headsetOutline, timeOutline
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

  // Control de roles para renderizar el menú condicionalmente
  esManager: boolean = false;
  esRRHH: boolean = false;
  esAdmin: boolean = false;

  constructor(private router: Router) {
    addIcons({
      calendarOutline, chevronForwardOutline, airplaneOutline, megaphoneOutline,
      chatbubblesOutline, peopleOutline, briefcaseOutline, shieldCheckmarkOutline,
      headsetOutline, timeOutline
    });
  }

  ngOnInit() {}

  // Lee los datos locales al entrar a la vista para calcular permisos
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

  // ==========================================
  // --- NAVEGACIÓN ---
  // ==========================================
  // Perfil del empleado
  goPerfil() { this.router.navigate(['/perfil']); }

  // Herramientas básicas
  goAusencias() { this.router.navigate(['/cuadrante'], { queryParams: { tab: 'ausencias' } }); }
  goVozEmpleado() { this.router.navigate(['/voz-empleado']); }
  goTickets() { this.router.navigate(['/tickets']); }

  // Herramientas de Mánager/RRHH
  goGestionEquipo() { this.router.navigate(['/gestion-equipo']); }
  goGestionEmpleados() { this.router.navigate(['/gestion-empleados']); }
  goGestionNoticias() { this.router.navigate(['/gestion-noticias']); }
  goControlFichajes() { this.router.navigate(['/control-fichajes']); }
  goSoporteTickets() { this.router.navigate(['/soporte-tickets']); }
  goGestionCuadrantes() { this.router.navigate(['/cuadrantes']); }

  // Herramientas de Admin
  goAdmin() { this.router.navigate(['/admin']); }
}
