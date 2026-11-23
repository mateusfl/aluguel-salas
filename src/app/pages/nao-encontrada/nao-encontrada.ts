import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrada',
  imports: [RouterLink],
  template: `
    <div class="hero min-h-[60vh]">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <p class="font-display text-accent text-7xl">404</p>
          <h1 class="font-display mt-3 text-3xl">A maré levou esta página</h1>
          <p class="text-base-content/65 mt-2">O endereço não existe ou mudou de lugar.</p>
          <a routerLink="/painel" class="btn btn-primary mt-6">Voltar ao painel</a>
        </div>
      </div>
    </div>
  `,
})
export class NaoEncontrada {}
