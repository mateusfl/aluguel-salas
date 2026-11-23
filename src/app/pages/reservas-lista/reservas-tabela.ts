import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reserva } from '../../models/reserva';
import { Sala } from '../../models/sala';
import { horaFinal } from '../../shared/datas';
import { Icone } from '../../shared/icone';
import { SeloSituacao } from '../../shared/selo-situacao';

@Component({
  selector: 'app-reservas-tabela',
  imports: [CurrencyPipe, DatePipe, RouterLink, Icone, SeloSituacao],
  templateUrl: './reservas-tabela.html',
})
export class ReservasTabela {
  readonly reservas = input.required<Reserva[]>();
  readonly salas = input.required<Sala[]>();
  readonly remover = output<Reserva>();

  protected readonly horaFinal = horaFinal;
  private readonly salasPorId = computed(() => new Map(this.salas().map((s) => [s.id, s])));

  protected sala(id: string) {
    return this.salasPorId().get(id);
  }
}
