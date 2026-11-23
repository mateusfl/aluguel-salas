import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ReservaCampos } from '../../models/reserva';
import { Sala } from '../../models/sala';
import { horaFinal } from '../../shared/datas';

/** Recibo que acompanha o formulário em tempo real, recebendo os valores por input signal. */
@Component({
  selector: 'app-resumo-reserva',
  imports: [CurrencyPipe, DatePipe],
  template: `
    <aside class="card bg-neutral text-neutral-content" aria-label="Resumo da reserva">
      <div class="card-body gap-4 p-6">
        <p class="text-neutral-content/65 text-sm">Resumo</p>
        <h2 class="font-display -mt-3 text-2xl">{{ sala()?.nome ?? 'Escolha uma sala' }}</h2>

        @if (sala(); as s) {
          <p class="text-neutral-content/75 text-sm">{{ s.descricao }}</p>
        }

        <dl
          class="border-neutral-content/25 flex flex-col gap-2 border-y border-dashed py-4 text-sm"
        >
          <div class="flex justify-between gap-3">
            <dt class="text-neutral-content/65">Data</dt>
            <dd class="font-medium tabular-nums">
              {{ dados().data ? (dados().data | date) : '—' }}
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-neutral-content/65">Horário</dt>
            <dd class="font-medium tabular-nums">{{ horario() }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-neutral-content/65">Pessoas</dt>
            <dd class="font-medium tabular-nums">
              {{ dados().participantes ?? '—' }}{{ sala() ? ' de ' + sala()!.capacidade : '' }}
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-neutral-content/65">Valor da hora</dt>
            <dd class="font-medium tabular-nums">
              {{ sala() ? (sala()!.precoHora | currency: 'BRL' : 'symbol' : '1.0-0') : '—' }}
            </dd>
          </div>
        </dl>

        <div class="flex items-baseline justify-between gap-3">
          <span class="text-sm">Total ({{ dados().horas }}h)</span>
          <span class="font-display text-accent text-3xl">
            {{ total() | currency: 'BRL' : 'symbol' : '1.0-0' }}
          </span>
        </div>
      </div>
    </aside>
  `,
})
export class ResumoReserva {
  readonly dados = input.required<ReservaCampos>();
  readonly sala = input<Sala>();

  protected readonly horario = computed(() => {
    const { inicio, horas } = this.dados();
    return inicio ? `${inicio}–${horaFinal(inicio, horas)}` : '—';
  });
  protected readonly total = computed(() => this.dados().horas * (this.sala()?.precoHora ?? 0));
}
