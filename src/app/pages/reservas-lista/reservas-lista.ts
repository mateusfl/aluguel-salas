import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reserva } from '../../models/reserva';
import { AvisosService } from '../../services/avisos.service';
import { ReservaService } from '../../services/reserva.service';
import { SalaService } from '../../services/sala.service';
import { mensagemDeErro } from '../../shared/api';
import { DialogoConfirmacao } from '../../shared/dialogo-confirmacao';
import { Icone } from '../../shared/icone';
import { ReservasFiltros } from './reservas-filtros';
import { ReservasTabela } from './reservas-tabela';

const POR_PAGINA = 8;

@Component({
  selector: 'app-reservas-lista',
  imports: [DatePipe, RouterLink, DialogoConfirmacao, Icone, ReservasFiltros, ReservasTabela],
  templateUrl: './reservas-lista.html',
})
export class ReservasLista {
  private readonly avisos = inject(AvisosService);
  protected readonly reservaService = inject(ReservaService);
  protected readonly salaService = inject(SalaService);

  protected readonly alvo = signal<Reserva | null>(null);
  protected readonly removendo = signal(false);

  // Volta para a primeira página sempre que os filtros mudam.
  private readonly paginaPedida = linkedSignal({
    source: this.reservaService.filtros,
    computation: () => 1,
  });

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.reservaService.filtradas().length / POR_PAGINA)),
  );
  protected readonly pagina = computed(() => Math.min(this.paginaPedida(), this.totalPaginas()));
  protected readonly paginas = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1),
  );
  protected readonly visiveis = computed(() => {
    const inicio = (this.pagina() - 1) * POR_PAGINA;
    return this.reservaService.filtradas().slice(inicio, inicio + POR_PAGINA);
  });

  protected irPara(pagina: number) {
    this.paginaPedida.set(pagina);
  }

  protected nomeDaSala(id: string) {
    return this.salaService.porId(id)?.nome ?? id;
  }

  protected async confirmarRemocao() {
    const reserva = this.alvo();
    if (!reserva) return;
    this.removendo.set(true);
    try {
      await this.reservaService.remover(reserva.id);
      this.avisos.sucesso(`Reserva de ${reserva.responsavel} removida.`);
      this.alvo.set(null);
    } catch (erro) {
      this.avisos.erro(mensagemDeErro(erro));
    } finally {
      this.removendo.set(false);
    }
  }
}
