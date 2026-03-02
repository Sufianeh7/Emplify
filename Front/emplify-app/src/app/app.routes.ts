import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    loadComponent: () => import('./inicio/inicio.page').then( m => m.InicioPage)
  },
  {
    path: 'cuadrante',
    loadComponent: () => import('./cuadrante/cuadrante.page').then( m => m.CuadrantePage)
  },
  {
    path: 'solicitudes',
    loadComponent: () => import('./solicitudes/solicitudes.page').then( m => m.SolicitudesPage)
  },
  {
    path: 'voz-empleado',
    loadComponent: () => import('./voz-empleado/voz-empleado.page').then( m => m.VozEmpleadoPage)
  },
  {
    path: 'tickets',
    loadComponent: () => import('./tickets/tickets.page').then( m => m.TicketsPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
  },
];
