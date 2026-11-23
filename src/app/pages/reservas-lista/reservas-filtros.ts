import { Component, input, model } from '@angular/core';
import { FILTROS_INICIAIS, FiltrosReserva } from '../../models/reserva';
import { Sala } from '../../models/sala';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-reservas-filtros',
  imports: [Icone],
  template: `
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
      <label class="input w-full lg:max-w-xs">
        <app-icone nome="busca" class="opacity-60" />
        <input
          type="search"
          class="grow"
          placeholder="Buscar por pessoa ou finalidade"
          aria-label="Buscar reservas"
          [value]="filtros().busca"
          (input)="alterar({ busca: $any($event.target).value })"
        />
      </label>

      <select
        class="select w-full lg:w-52"
        aria-label="Filtrar por sala"
        (change)="alterar({ salaId: $any($event.target).value })"
      >
        <option value="" [selected]="!filtros().salaId">Todas as salas</option>
        @for (sala of salas(); track sala.id) {
          <option [value]="sala.id" [selected]="sala.id === filtros().salaId">
            {{ sala.nome }}
          </option>
        }
      </select>

      <div role="tablist" aria-label="Período" class="tabs tabs-box tabs-sm w-fit">
        @for (opcao of periodos; track opcao.valor) {
          <button
            type="button"
            role="tab"
            class="tab"
            [class.tab-active]="filtros().periodo === opcao.valor"
            [attr.aria-selected]="filtros().periodo === opcao.valor"
            (click)="alterar({ periodo: opcao.valor })"
          >
            {{ opcao.rotulo }}
          </button>
        }
      </div>

      <div role="tablist" aria-label="Situação" class="tabs tabs-box tabs-sm w-fit">
        @for (opcao of situacoes; track opcao.valor) {
          <button
            type="button"
            role="tab"
            class="tab"
            [class.tab-active]="filtros().situacao === opcao.valor"
            [attr.aria-selected]="filtros().situacao === opcao.valor"
            (click)="alterar({ situacao: opcao.valor })"
          >
            {{ opcao.rotulo }}
          </button>
        }
      </div>

      @if (filtrosAtivos()) {
        <button type="button" class="btn btn-ghost btn-sm" (click)="filtros.set(padrao)">
          Limpar
        </button>
      }
    </div>
  `,
})
export class ReservasFiltros {
  /** model() cria a comunicação de mão dupla com o componente pai: [(filtros)]. */
  readonly filtros = model.required<FiltrosReserva>();
  readonly salas = input.required<Sala[]>();

  protected readonly padrao = FILTROS_INICIAIS;
  protected readonly periodos: { valor: FiltrosReserva['periodo']; rotulo: string }[] = [
    { valor: 'proximas', rotulo: 'Próximas' },
    { valor: 'passadas', rotulo: 'Passadas' },
    { valor: 'todas', rotulo: 'Todas' },
  ];
  protected readonly situacoes: { valor: FiltrosReserva['situacao']; rotulo: string }[] = [
    { valor: 'todas', rotulo: 'Todas' },
    { valor: 'confirmadas', rotulo: 'Confirmadas' },
    { valor: 'pendentes', rotulo: 'Pendentes' },
  ];

  protected filtrosAtivos() {
    return JSON.stringify(this.filtros()) !== JSON.stringify(this.padrao);
  }

  protected alterar(mudanca: Partial<FiltrosReserva>) {
    this.filtros.update((atual) => ({ ...atual, ...mudanca }));
  }
}
