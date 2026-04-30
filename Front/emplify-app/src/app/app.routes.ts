import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/guard/auth-guard';

export const routes: Routes = [
  // ==========================================
  // RUTA PÚBLICA (LOGIN)
  // ==========================================
  {
    path: 'home',
    loadComponent: () =>
      import('./core/auth/home/home.page').then((m) => m.HomePage),
  },

  // ==========================================
  // ESTRUCTURA TABS
  // ==========================================
  {
    path: '',
    loadComponent: () =>
      import('./layouts/tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [AuthGuard], // Protegemos el marco
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/empleado/inicio/inicio.page').then(
            (m) => m.InicioPage,
          ),
      },
      {
        path: 'noticias',
        loadComponent: () =>
          import('./features/empleado/noticias/noticias.page').then(
            (m) => m.NoticiasPage,
          ),
      },
      {
        path: 'cuadrante',
        loadComponent: () =>
          import('./features/empleado/cuadrante/cuadrante.page').then(
            (m) => m.CuadrantePage,
          ),
      },
      {
        path: 'mas',
        loadComponent: () =>
          import('./features/empleado/mas/mas.page').then((m) => m.MasPage),
      },
      // --- PÁGINAS DEL EMPLEADO ---
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('./features/empleado/solicitudes/solicitudes.page').then(
            (m) => m.SolicitudesPage,
          ),
      },
      {
        path: 'voz-empleado',
        loadComponent: () =>
          import('./features/empleado/voz-empleado/voz-empleado.page').then(
            (m) => m.VozEmpleadoPage,
          ),
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/empleado/tickets/tickets.page').then(
            (m) => m.TicketsPage,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/empleado/perfil/perfil.page').then(
            (m) => m.PerfilPage,
          ),
      },
      // --- PÁGINAS DE GESTIÓN---
      {
        path: 'gestion-equipo',
        loadComponent: () =>
          import('./features/rrhh/gestion-equipo/gestion-equipo.page').then(
            (m) => m.GestionEquipoPage,
          ),
      },
      {
        path: 'gestion-empleados',
        loadComponent: () =>
          import('./features/rrhh/gestion-empleados/gestion-empleados.page').then(
            (m) => m.GestionEmpleadosPage,
          ),
      },
      {
        path: 'soporte-tickets',
        loadComponent: () =>
          import('./features/rrhh/soporte-tickets/soporte-tickets.page').then(
            (m) => m.SoporteTicketsPage,
          ),
      },
      {
        path: 'control-fichajes',
        loadComponent: () =>
          import('./features/rrhh/control-fichajes/control-fichajes.page').then(
            (m) => m.ControlFichajesPage,
          ),
      },
      {
        path: 'gestion-noticias',
        loadComponent: () =>
          import('./features/rrhh/gestion-noticias/gestion-noticias.page').then(
            (m) => m.GestionNoticiasPage,
          ),
      },
      {
        path: 'cuadrantes',
        loadComponent: () =>
          import('./features/rrhh/cuadrantes/cuadrantes.page').then(
            (m) => m.CuadrantesPage,
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/admin/admin/admin.page').then((m) => m.AdminPage),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
];
