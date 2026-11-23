import { Routes } from '@angular/router';
import { authGuard, visitanteGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar · Casa Maré',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'painel' },
      {
        path: 'painel',
        title: 'Painel · Casa Maré',
        loadComponent: () => import('./pages/painel/painel').then((m) => m.Painel),
      },
      {
        path: 'reservas',
        title: 'Reservas · Casa Maré',
        loadComponent: () =>
          import('./pages/reservas-lista/reservas-lista').then((m) => m.ReservasLista),
      },
      {
        path: 'reservas/nova',
        title: 'Nova reserva · Casa Maré',
        loadComponent: () =>
          import('./pages/reserva-formulario/reserva-formulario').then((m) => m.ReservaFormulario),
      },
      {
        path: 'reservas/:id',
        title: 'Detalhes da reserva · Casa Maré',
        loadComponent: () =>
          import('./pages/reserva-detalhe/reserva-detalhe').then((m) => m.ReservaDetalhe),
      },
      {
        path: 'reservas/:id/editar',
        title: 'Alterar reserva · Casa Maré',
        loadComponent: () =>
          import('./pages/reserva-formulario/reserva-formulario').then((m) => m.ReservaFormulario),
      },
      {
        path: 'salas',
        title: 'Salas · Casa Maré',
        loadComponent: () => import('./pages/salas/salas').then((m) => m.Salas),
      },
      {
        path: '**',
        title: 'Página não encontrada · Casa Maré',
        loadComponent: () =>
          import('./pages/nao-encontrada/nao-encontrada').then((m) => m.NaoEncontrada),
      },
    ],
  },
];
