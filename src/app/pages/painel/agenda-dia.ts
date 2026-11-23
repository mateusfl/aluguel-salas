import { DatePipe } from '@angular/common';
import { Component, computed, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reserva } from '../../models/reserva';
import { Sala } from '../../models/sala';
import {
  ABERTURA,
  deIso,
  FECHAMENTO,
  horaFinal,
  hojeIso,
  paraIso,
  paraMinutos,
  somarDias,
} from '../../shared/datas';
import { Icone } from '../../shared/icone';

const JORNADA = FECHAMENTO - ABERTURA;

/** A "régua da maré": a ocupação de cada sala ao longo do dia. */
@Component({
  selector: 'app-agenda-dia',
  imports: [DatePipe, RouterLink, Icone],
  templateUrl: './agenda-dia.html',
})
export class AgendaDia {
  readonly salas = input.required<Sala[]>();
  readonly reservas = input.required<Reserva[]>();
  readonly dia = model.required<string>();

  protected readonly marcas = [8, 10, 12, 14, 16, 18, 20];
  protected readonly dataDoDia = computed(() => deIso(this.dia()));
  protected readonly ehHoje = computed(() => this.dia() === hojeIso());

  protected readonly linhas = computed(() => {
    const doDia = this.reservas().filter((r) => paraIso(r.data) === this.dia());
    return this.salas().map((sala) => ({
      sala,
      blocos: doDia
        .filter((r) => r.salaId === sala.id)
        .map((reserva) => ({
          reserva,
          fim: horaFinal(reserva.inicio, reserva.horas),
          esquerda: ((paraMinutos(reserva.inicio) - ABERTURA) / JORNADA) * 100,
          largura: ((reserva.horas * 60) / JORNADA) * 100,
        })),
    }));
  });

  protected readonly agora = computed(() => {
    if (!this.ehHoje()) return null;
    const data = new Date();
    const minutos = data.getHours() * 60 + data.getMinutes();
    return minutos >= ABERTURA && minutos <= FECHAMENTO
      ? ((minutos - ABERTURA) / JORNADA) * 100
      : null;
  });

  protected mover(dias: number) {
    this.dia.update((dia) => somarDias(dia, dias));
  }

  protected irParaHoje() {
    this.dia.set(hojeIso());
  }
}
