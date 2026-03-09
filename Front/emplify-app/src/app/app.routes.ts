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
  // ESTRUCTURA TABS (VISTA EMPLEADO) - URL LIMPIA
  // ==========================================
  {
    path: '', // <-- Magia: el marco de los tabs ya no añade "/tabs" a la URL
    loadComponent: () =>
      import('./layouts/tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [AuthGuard], // Protegemos el marco, así sus hijos también lo están
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/empleado/inicio/inicio.page').then(
            (m) => m.InicioPage,
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
      {
        path: '',
        redirectTo: 'inicio', // Cuando entren a "/", los manda a "/inicio"
        pathMatch: 'full',
      },
    ],
  },

  // ==========================================
  // RUTAS SUELTAS Y GESTIÓN RRHH/ADMIN
  // ==========================================
  {
    path: 'solicitudes',
    loadComponent: () =>
      import('./features/empleado/solicitudes/solicitudes.page').then(
        (m) => m.SolicitudesPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'voz-empleado',
    loadComponent: () =>
      import('./features/empleado/voz-empleado/voz-empleado.page').then(
        (m) => m.VozEmpleadoPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./features/empleado/tickets/tickets.page').then(
        (m) => m.TicketsPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./features/empleado/perfil/perfil.page').then(
        (m) => m.PerfilPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'gestion-equipo',
    loadComponent: () =>
      import('./features/rrhh/gestion-equipo/gestion-equipo.page').then(
        (m) => m.GestionEquipoPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'soporte-tickets',
    loadComponent: () =>
      import('./features/rrhh/soporte-tickets/soporte-tickets.page').then(
        (m) => m.SoporteTicketsPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'cuadrantes',
    loadComponent: () =>
      import('./features/rrhh/cuadrantes/cuadrantes.page').then(
        (m) => m.CuadrantesPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin/admin.page').then((m) => m.AdminPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'gestion-empleados',
    loadComponent: () =>
      import('./features/rrhh/gestion-empleados/gestion-empleados.page').then(
        (m) => m.GestionEmpleadosPage,
      ),
    canActivate: [AuthGuard],
  },
];
