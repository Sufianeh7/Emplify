import { Routes } from '@angular/router';
import { AuthGuard } from './guard/auth-guard';

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
    loadComponent: () => import('./inicio/inicio.page').then( m => m.InicioPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'cuadrante',
    loadComponent: () => import('./cuadrante/cuadrante.page').then( m => m.CuadrantePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'solicitudes',
    loadComponent: () => import('./solicitudes/solicitudes.page').then( m => m.SolicitudesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'voz-empleado',
    loadComponent: () => import('./voz-empleado/voz-empleado.page').then( m => m.VozEmpleadoPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'tickets',
    loadComponent: () => import('./tickets/tickets.page').then( m => m.TicketsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'equipo',
    loadComponent: () => import('./equipo/equipo.page').then( m => m.EquipoPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestion-rrhh',
    loadComponent: () => import('./gestion-rrhh/gestion-rrhh.page').then( m => m.GestionRRHHPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'cuadrantes',
    loadComponent: () => import('./cuadrantes/cuadrantes.page').then( m => m.CuadrantesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then( m => m.AdminPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'rrhh',
    loadComponent: () => import('./rrhh/rrhh.page').then( m => m.RrhhPage),
    canActivate: [AuthGuard]
  },
];
