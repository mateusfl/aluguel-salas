import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../shared/api';
import { AuthService } from './auth.service';

/** Envia o JWT em toda chamada à API e encerra a sessão se o token for recusado. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  if (!token || !req.url.startsWith(API_URL)) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((erro: unknown) => {
      if (erro instanceof HttpErrorResponse && erro.status === 401) auth.expirar();
      return throwError(() => erro);
    }),
  );
};
