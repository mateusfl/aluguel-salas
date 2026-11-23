import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reserva } from '../../models/reserva';
import { AuthService } from '../../services/auth.service';
import { AvisosService } from '../../services/avisos.service';
import { ReservaService } from '../../services/reserva.service';
import { SalaService } from '../../services/sala.service';
import { mensagemDeErro } from '../../shared/api';
import { ABERTURA, FECHAMENTO, hojeIso, horaFinal, paraIso, somarDias } from '../../shared/datas';
import { Icone } from '../../shared/icone';
import { AgendaDia } from './agenda-dia';

@Component({
  selector: 'app-painel',
  imports: [CurrencyPipe, DatePipe, RouterLink, AgendaDia, Icone],
  templateUrl: './painel.html',
})
export class Painel {
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(AvisosService);
  protected readonly reservaService = inject(ReservaService);
  protected readonly salaService = inject(SalaService);

  protected readonly horaFinal = horaFinal;
  protected readonly dia = signal(hojeIso());
  protected readonly confirmando = signal<number | null>(null);

  protected readonly saudacao = computed(() => {
    const hora = new Date().getHours();
    const periodo = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    return `${periodo}, ${this.auth.usuario()?.nome.split(' ')[0] ?? ''}`;
  });

  private readonly deHoje = computed(() =>
    this.reservaService.reservas().filter((r) => paraIso(r.data) === hojeIso()),
  );

  protected readonly totalHoje = computed(() => this.deHoje().length);

  protected readonly ocupacao = computed(() => {
    const salas = this.salaService.salas().length;
    if (!salas) return 0;
    const horas = this.deHoje().reduce((total, r) => total + r.horas, 0);
    return Math.round((horas / (salas * ((FECHAMENTO - ABERTURA) / 60))) * 100);
  });

  protected readonly receitaSemana = computed(() => {
    const inicio = hojeIso();
    const fim = somarDias(inicio, 6);
    return this.reservaService.reservas().reduce((total, r) => {
      const iso = paraIso(r.data);
      if (iso < inicio || iso > fim) return total;
      return total + r.horas * (this.salaService.porId(r.salaId)?.precoHora ?? 0);
    }, 0);
  });

  protected readonly aguardando = computed(() => this.reservaService.pendentes().slice(0, 4));

  protected nomeDaSala(id: string) {
    return this.salaService.porId(id)?.nome ?? id;
  }

  protected async confirmar(reserva: Reserva) {
    this.confirmando.set(reserva.id);
    try {
      await this.reservaService.alternarConfirmacao(reserva);
      this.avisos.sucesso(`Reserva de ${reserva.responsavel} confirmada.`);
    } catch (erro) {
      this.avisos.erro(mensagemDeErro(erro));
    } finally {
      this.confirmando.set(null);
    }
  }
}
