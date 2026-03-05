import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  calendarOutline,
  airplaneOutline,
  megaphoneOutline,
  ticketOutline,
  personCircleOutline,
  peopleOutline,
  briefcaseOutline,
  settingsOutline // <-- Añadimos el icono para el panel de Admin
} from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class InicioPage implements OnInit {
  nombreUsuario: string = '';
  nombreEmpresa: string = '';

  // Variables booleanas para mostrar/ocultar botones en el HTML
  esManager: boolean = false;
  esRRHH: boolean = false;
  esAdmin: boolean = false; // <-- NUEVA: Controla la vista del Administrador

  constructor(private router: Router) {
    addIcons({
      calendarOutline,
      airplaneOutline,
      megaphoneOutline,
      ticketOutline,
      personCircleOutline,
      peopleOutline,
      briefcaseOutline,
      settingsOutline // <-- Registramos el icono
    });
  }

  ngOnInit() {
    // Lo dejamos vacío porque ionViewWillEnter se ejecuta cada vez que
    // entramos en la pantalla, asegurando que los datos siempre estén frescos.
  }

  ionViewWillEnter() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');

    if (datosGuardados) {
      const empleado = JSON.parse(datosGuardados);

      // 1. Cargamos datos de presentación
      this.nombreUsuario = empleado?.usuario?.nombre || empleado?.usuario?.email || 'Compañero/a';
      this.nombreEmpresa = empleado?.empresa?.nombre || 'tu empresa';

      // 2. Comprobamos los roles (todo centralizado y limpio)
      const rol = empleado.usuario?.rol;

      this.esManager = (rol === 'MANAGER');
      this.esRRHH = (rol === 'RRHH' || rol === 'ADMIN'); // Permitimos que el ADMIN también vea lo de RRHH
      this.esAdmin = (rol === 'ADMIN'); // Solo el ADMIN verá el panel de crear empresas
    }
  }

  cerrarSesion() {
    localStorage.clear();
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/home']);
  }

  // --- NAVEGACIÓN ---

  goCuadrante() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/cuadrante']);
  }

  goSolicitudes() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/solicitudes']);
  }

  goVozEmpleado() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/voz-empleado']);
  }

  goTickets() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/tickets']);
  }

  goPerfil() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/perfil']);
  }

  goEquipo() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/equipo']);
  }

  goGestionRRHH() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    // Lo he cambiado a '/rrhh' basándome en la página que creamos antes.
    // (Cámbialo a '/gestion-rrhh' si al final la llamaste así en el app.routes.ts)
    this.router.navigate(['/gestion-rrhh']);
  }

  goGestionCuadrantes() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/cuadrantes']);
  }

  // --- NUEVO MÉTODO PARA EL ADMIN ---
  goAdmin() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/admin']);
  }
}
