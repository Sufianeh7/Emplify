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
];
