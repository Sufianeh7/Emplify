import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router'; // <-- Añadimos Router aquí

import { addIcons } from 'ionicons';
import { calendarOutline, airplaneOutline } from 'ionicons/icons';

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
    addIcons({ calendarOutline, airplaneOutline });
  }

  ngOnInit() {
    const datosGuardados = localStorage.getItem('empleadoLogueado');

    if (datosGuardados) {
      const empleado = JSON.parse(datosGuardados);
      this.nombreUsuario = empleado[0]?.usuario?.nombre || empleado[0]?.usuario?.email || 'Compañero/a';
      this.nombreEmpresa = empleado[0]?.empresa?.nombre || 'tu empresa';
    }
  }

  // --- NUEVA FUNCIÓN ---
  goCuadrante() {
    // 1. Quitamos el foco del botón del menú
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    // 2. Navegamos a la pantalla del cuadrante
    this.router.navigate(['/cuadrante']);
  }
}
