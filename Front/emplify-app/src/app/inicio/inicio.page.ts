import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router'; // <-- Añadimos Router aquí

import { addIcons } from 'ionicons';
import {
  calendarOutline,
  airplaneOutline,
  megaphoneOutline,
  ticketOutline,
  personCircleOutline,
  peopleOutline,
  briefcaseOutline,
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
  esManager: boolean = false;
  esRRHH: boolean = false;

  // Inyectamos el Router en el constructor
  constructor(private router: Router) {
    addIcons({
      calendarOutline,
      airplaneOutline,
      megaphoneOutline,
      ticketOutline,
      personCircleOutline,
      peopleOutline,
      briefcaseOutline
    });
  }

  ngOnInit() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');

    if (datosGuardados) {
      const empleado = JSON.parse(datosGuardados);
      console.log(empleado);
      console.log(empleado.usuario.nombre);

      this.nombreUsuario =
        empleado?.usuario?.nombre || empleado?.usuario?.email || 'Compañero/a';
      this.nombreEmpresa = empleado?.empresa?.nombre || 'tu empresa';
    }
  }

  ionViewWillEnter() {
    const empleado = JSON.parse(
      localStorage.getItem('empleadoLogueado') || '{}',
    );
    this.esRRHH =
      empleado.usuario?.rol === 'RRHH' || empleado.usuario?.rol === 'ADMIN';

    // Leemos el empleado logueado para saber su rol
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      const empleado = JSON.parse(datos);
      // Comprobamos si el rol en su tabla Usuario es MANAGER
      this.esManager = empleado.usuario?.rol === 'MANAGER';
    }
  }

  // --- NUEVA FUNCIÓN ---
  cerrarSesion() {
    localStorage.clear();
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/home']);
  }

  goCuadrante() {
    // 1. Quitamos el foco del botón del menú
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    // 2. Navegamos a la pantalla del cuadrante
    this.router.navigate(['/cuadrante']);
  }

  goSolicitudes() {
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    // Navegamos a la pantalla de solicitudes
    this.router.navigate(['/solicitudes']);
  }

  goVozEmpleado() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/voz-empleado']);
  }

  goTickets() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['tickets']);
  }

  goPerfil() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['perfil']);
  }

  goEquipo() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/equipo']);
  }

  goGestionRRHH() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['gestion-rrhh']);
  }

  goGestionCuadrantes() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['cuadrantes']);
  }
}
