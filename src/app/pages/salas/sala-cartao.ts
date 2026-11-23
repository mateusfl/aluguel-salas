import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sala } from '../../models/sala';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-sala-cartao',
  imports: [CurrencyPipe, RouterLink, Icone],
  host: { class: 'block h-full' },
  template: `
    <article
      class="card bg-base-100 border-base-300 hover:border-primary h-full border transition-colors"
    >
      <div class="card-body gap-3 p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-base-content/60 text-xs">{{ sala().andar }}</p>
            <h2 class="font-display text-2xl leading-tight">{{ sala().nome }}</h2>
          </div>
          <span class="badge badge-soft badge-primary gap-1 whitespace-nowrap">
            <app-icone nome="pessoas" /> {{ sala().capacidade }}
          </span>
        </div>

        <p class="text-base-content/75 text-sm">{{ sala().descricao }}</p>

        <div class="flex flex-wrap gap-1.5">
          @for (recurso of sala().recursos; track recurso) {
            <span class="badge badge-ghost badge-sm">{{ recurso }}</span>
          }
        </div>

        <div
          class="border-base-300 mt-auto flex items-center justify-between gap-3 border-t border-dashed pt-4"
        >
          <div>
            <span class="font-display text-xl">
              {{ sala().precoHora | currency: 'BRL' : 'symbol' : '1.0-0' }}
            </span>
            <span class="text-base-content/60 text-xs">/hora</span>
            <p class="text-base-content/60 text-xs">
              {{
                reservasHoje() === 0 ? 'Livre o dia todo hoje' : reservasHoje() + ' reserva(s) hoje'
              }}
            </p>
          </div>
          <a
            class="btn btn-primary btn-sm"
            routerLink="/reservas/nova"
            [queryParams]="{ sala: sala().id }"
          >
            Reservar
          </a>
        </div>
      </div>
    </article>
  `,
})
export class SalaCartao {
  readonly sala = input.required<Sala>();
  readonly reservasHoje = input(0);
}
