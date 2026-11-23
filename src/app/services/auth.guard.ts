import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Protege as telas internas e guarda para onde o usuário queria ir. */
export const authGuard: CanActivateFn = (_rota, estado) => {
  const router = inject(Router);
  return (
    inject(AuthService).autenticado() ||
    router.createUrlTree(['/login'], { queryParams: { voltar: estado.url } })
  );
};

/** Quem já entrou não precisa ver a tela de login. */
export const visitanteGuard: CanActivateFn = () => {
  const router = inject(Router);
  return !inject(AuthService).autenticado() || router.createUrlTree(['/painel']);
};
