import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AvisosService } from '../../services/avisos.service';
import { ReservaService } from '../../services/reserva.service';
import { SalaService } from '../../services/sala.service';
import { mensagemDeErro } from '../../shared/api';
import { horaFinal } from '../../shared/datas';
import { DialogoConfirmacao } from '../../shared/dialogo-confirmacao';
import { Icone } from '../../shared/icone';
import { SeloSituacao } from '../../shared/selo-situacao';

@Component({
  selector: 'app-reserva-detalhe',
  imports: [CurrencyPipe, DatePipe, RouterLink, DialogoConfirmacao, Icone, SeloSituacao],
  templateUrl: './reserva-detalhe.html',
})
export class ReservaDetalhe {
  private readonly router = inject(Router);
  private readonly avisos = inject(AvisosService);
  private readonly reservas = inject(ReservaService);
  private readonly salas = inject(SalaService);

  /** Parâmetro :id da rota, entregue pelo withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly recurso = this.reservas.recursoPorId(this.id);
  protected readonly reserva = computed(() =>
    this.recurso.hasValue() ? this.recurso.value() : null,
  );
  protected readonly sala = computed(() => {
    const reserva = this.reserva();
    return reserva ? this.salas.porId(reserva.salaId) : undefined;
  });
  protected readonly fim = computed(() => {
    const reserva = this.reserva();
    return reserva ? horaFinal(reserva.inicio, reserva.horas) : '';
  });
  protected readonly total = computed(
    () => (this.reserva()?.horas ?? 0) * (this.sala()?.precoHora ?? 0),
  );

  protected readonly dialogoAberto = signal(false);
  protected readonly ocupado = signal(false);

  protected async alternar() {
    const reserva = this.reserva();
    if (!reserva) return;
    this.ocupado.set(true);
    try {
      const salva = await this.reservas.alternarConfirmacao(reserva);
      this.recurso.set(salva);
      this.avisos.sucesso(
        salva.confirmada ? 'Reserva confirmada.' : 'Reserva voltou para pendente.',
      );
    } catch (erro) {
      this.avisos.erro(mensagemDeErro(erro));
    } finally {
      this.ocupado.set(false);
    }
  }

  protected async remover() {
    const reserva = this.reserva();
    if (!reserva) return;
    this.ocupado.set(true);
    try {
      await this.reservas.remover(reserva.id);
      this.avisos.sucesso(`Reserva de ${reserva.responsavel} removida.`);
      this.dialogoAberto.set(false);
      await this.router.navigateByUrl('/reservas');
    } catch (erro) {
      this.avisos.erro(mensagemDeErro(erro));
    } finally {
      this.ocupado.set(false);
    }
  }
}
