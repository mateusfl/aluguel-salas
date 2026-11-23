import { Component, computed, inject, signal } from '@angular/core';
import { ReservaService } from '../../services/reserva.service';
import { SalaService } from '../../services/sala.service';
import { hojeIso, paraIso } from '../../shared/datas';
import { Icone } from '../../shared/icone';
import { SalaCartao } from './sala-cartao';

@Component({
  selector: 'app-salas',
  imports: [Icone, SalaCartao],
  template: `
    <div class="motion-safe:animate-subir flex flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="font-display text-3xl sm:text-4xl">Nossas salas</h1>
          <p class="text-base-content/65 mt-1 max-w-xl">
            Cinco espaços num casarão restaurado da Ribeira, cada um batizado com um pedaço de
            Natal.
          </p>
        </div>
        <label class="w-full sm:w-64">
          <span class="flex justify-between text-sm font-medium">
            Quantas pessoas?
            <span class="badge badge-primary badge-soft badge-sm">{{ pessoas() }}</span>
          </span>
          <input
            type="range"
            min="1"
            max="40"
            class="range range-primary range-xs mt-2 w-full"
            [value]="pessoas()"
            (input)="pessoas.set($any($event.target).valueAsNumber)"
          />
        </label>
      </header>

      @if (servico.falhou()) {
        <div role="alert" class="alert alert-error alert-soft">
          <app-icone nome="alerta" />
          <span>Não foi possível carregar as salas.</span>
          <button type="button" class="btn btn-sm" (click)="servico.recarregar()">
            Tentar de novo
          </button>
        </div>
      } @else if (servico.carregando() && !servico.salas().length) {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Carregando salas">
          <div class="skeleton h-72"></div>
          <div class="skeleton h-72"></div>
          <div class="skeleton h-72"></div>
        </div>
      } @else {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (sala of visiveis(); track sala.id) {
            <app-sala-cartao [sala]="sala" [reservasHoje]="contagemHoje().get(sala.id) ?? 0" />
          }
        </div>
      }
    </div>
  `,
})
export class Salas {
  protected readonly servico = inject(SalaService);
  private readonly reservas = inject(ReservaService);

  protected readonly pessoas = signal(1);
  protected readonly visiveis = computed(() =>
    this.servico.salas().filter((sala) => sala.capacidade >= this.pessoas()),
  );

  protected readonly contagemHoje = computed(() => {
    const contagem = new Map<string, number>();
    for (const r of this.reservas.reservas()) {
      if (paraIso(r.data) === hojeIso()) contagem.set(r.salaId, (contagem.get(r.salaId) ?? 0) + 1);
    }
    return contagem;
  });
}
