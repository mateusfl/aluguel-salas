import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ConfirmDialogModule } from '@openng/optimus-ui/confirmdialog';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';
import { ToastModule } from '@openng/optimus-ui/toast';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { Reserva, SALAS } from './reserva';

@Component({
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule,
    ToggleSwitchModule,
    ToolbarModule,
  ],
  providers: [ConfirmationService, MessageService],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly salas = SALAS;

  // lista em memória
  protected readonly reservas = signal<Reserva[]>([
    { id: 1, sala: 'Sala Atlântico', responsavel: 'Ana Souza', participantes: 6, data: new Date(2026, 9, 8), confirmada: true },
    { id: 2, sala: 'Sala Potengi', responsavel: 'Bruno Lima', participantes: 4, data: new Date(2026, 9, 9), confirmada: false },
    { id: 3, sala: 'Auditório Natal', responsavel: 'Carla Medeiros', participantes: 40, data: new Date(2026, 9, 15), confirmada: true },
    { id: 4, sala: 'Sala Dunas', responsavel: 'Diego Fernandes', participantes: 10, data: new Date(2026, 9, 20), confirmada: false },
  ]);
  private proximoId = 5;

  // estado dos diálogos
  protected formVisivel = false;
  protected detalheVisivel = false;
  protected enviado = false;
  protected reserva: Reserva = this.novaReserva();
  protected selecionada: Reserva | null = null;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  protected get totalConfirmadas(): number {
    return this.reservas().filter((r) => r.confirmada).length;
  }

  // incluir
  protected abrirNova() {
    this.reserva = this.novaReserva();
    this.enviado = false;
    this.formVisivel = true;
  }

  // alterar (edita uma cópia para não mexer na lista antes de salvar)
  protected abrirEdicao(reserva: Reserva) {
    this.reserva = { ...reserva };
    this.enviado = false;
    this.formVisivel = true;
  }

  // detalhar
  protected detalhar(reserva: Reserva) {
    this.selecionada = reserva;
    this.detalheVisivel = true;
  }

  protected salvar() {
    this.enviado = true;
    if (!this.reserva.sala || !this.reserva.responsavel.trim() || !this.reserva.data || !this.reserva.participantes) {
      return;
    }

    if (this.reserva.id) {
      this.reservas.update((lista) => lista.map((r) => (r.id === this.reserva.id ? this.reserva : r)));
      this.avisar('Reserva alterada');
    } else {
      this.reservas.update((lista) => [...lista, { ...this.reserva, id: this.proximoId++ }]);
      this.avisar('Reserva incluída');
    }
    this.formVisivel = false;
  }

  // remover
  protected remover(reserva: Reserva) {
    this.confirmationService.confirm({
      header: 'Remover reserva',
      message: `Deseja remover a reserva de ${reserva.responsavel} na ${reserva.sala}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.reservas.update((lista) => lista.filter((r) => r.id !== reserva.id));
        this.avisar('Reserva removida');
      },
    });
  }

  private novaReserva(): Reserva {
    return { id: 0, sala: '', responsavel: '', participantes: 1, data: new Date(), confirmada: false };
  }

  private avisar(mensagem: string) {
    this.messageService.add({ severity: 'success', summary: 'Tudo certo', detail: mensagem, life: 3000 });
  }
}
