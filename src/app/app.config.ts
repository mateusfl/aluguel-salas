import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding entrega parâmetros da rota direto nos input() dos componentes
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { dateFormat: 'dd/MM/yyyy', timezone: 'UTC' } },
  ],
};
