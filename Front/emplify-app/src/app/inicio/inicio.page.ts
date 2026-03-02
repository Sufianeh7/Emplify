import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router'; // <-- Añadimos Router aquí

import { addIcons } from 'ionicons';
import { calendarOutline, airplaneOutline, megaphoneOutline, ticketOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class InicioPage implements OnInit {

  nombreUsuario: string = '';
  nombreEmpresa: string = '';

  // Inyectamos el Router en el constructor
  constructor(private router: Router) {
    addIcons({ calendarOutline, airplaneOutline, megaphoneOutline, ticketOutline, personCircleOutline });
  }

  ngOnInit() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');

    if (datosGuardados) {
      const empleado = JSON.parse(datosGuardados);
      console.log(empleado);
      console.log(empleado.usuario.nombre);


      this.nombreUsuario = empleado?.usuario?.nombre || empleado?.usuario?.email || 'Compañero/a';
      this.nombreEmpresa = empleado?.empresa?.nombre || 'tu empresa';
    }
  }

  // --- NUEVA FUNCIÓN ---
  cerrarSesion(){
    localStorage.clear()

    this.router.navigate(['/home'])
  }

  goCuadrante() {
    // 1. Quitamos el foco del botón del menú
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    // 2. Navegamos a la pantalla del cuadrante
    this.router.navigate(['/cuadrante']);
  }

  goSolicitudes(){
    if(document.activeElement){
      (document.activeElement as HTMLElement).blur();
    }

    // Navegamos a la pantalla de solicitudes
    this.router.navigate(['/solicitudes'])
  }

  goVozEmpleado() {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['/voz-empleado']);
  }

  goTickets(){
    if(document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['tickets'])
  }

  goPerfil(){
    if(document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['perfil'])
  }


}
