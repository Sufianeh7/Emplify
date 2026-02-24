import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 1. Importamos IonicModule y RouterModule
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; // Necesario para el routerLink del botón

// Importamos la función para añadir iconos y los dibujos específicos
import { addIcons } from 'ionicons';
import { calendarOutline, airplaneOutline } from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  // 2. Añadimos IonicModule y RouterModule a la lista de imports
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class InicioPage implements OnInit {

  // Creamos la variables
  nombreUsuario: string = '';
  nombreEmpresa: string = '';

  constructor() {
    // Registramos los iconos en el constructor para que el HTML pueda usarlos
    addIcons({ calendarOutline, airplaneOutline });
  }

  ngOnInit() {

    // 1. Buscamos los datos en la mochila
    const datosGuardados = localStorage.getItem('empleadoLogueado');

    if (datosGuardados) {
      // 2. Si hay datos, los volvemos a convertir en un objeto real
      const empleado = JSON.parse(datosGuardados);

      // 3. Extraemos la información (usamos || por si acaso el nombre viene vacío en la BD)
      this.nombreUsuario = empleado[0]?.usuario?.nombre || empleado[0]?.usuario?.email || 'Compañero/a';
      this.nombreEmpresa = empleado[0]?.empresa?.nombre || 'tu empresa';

      // Nota: Ponemos empleado[0] porque tu backend de Spring devuelve una lista (un Array) de empleados al hacer el GET general.

    }
  }

}
