import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemaService } from './services/tema.service';
import { PilhaAvisos } from './shared/pilha-avisos';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PilhaAvisos],
  template: `
    <router-outlet />
    <app-pilha-avisos />
  `,
})
export class App {
  // Injetado aqui para aplicar o tema salvo já na abertura, inclusive na tela de login.
  private readonly tema = inject(TemaService);
}
