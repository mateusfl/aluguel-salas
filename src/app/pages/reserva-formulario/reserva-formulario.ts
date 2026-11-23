import { HttpParams } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  max,
  maxLength,
  min,
  minDate,
  minLength,
  required,
  validate,
  validateHttp,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Disponibilidade, Reserva, ReservaCampos, ReservaDados } from '../../models/reserva';
import { AvisosService } from '../../services/avisos.service';
import { ReservaService } from '../../services/reserva.service';
import { SalaService } from '../../services/sala.service';
import { API_URL, errosDoServidor } from '../../shared/api';
import { deIso, FECHAMENTO, hojeIso, HORARIOS, paraIso, paraMinutos } from '../../shared/datas';
import { ErrosCampo } from '../../shared/erros-campo';
import { Icone } from '../../shared/icone';
import { ResumoReserva } from './resumo-reserva';

const paraCampos = ({ id: _id, ...reserva }: Reserva): ReservaCampos => reserva;

@Component({
  selector: 'app-reserva-formulario',
  imports: [FormField, FormRoot, RouterLink, ErrosCampo, Icone, ResumoReserva],
  templateUrl: './reserva-formulario.html',
})
export class ReservaFormulario {
  private readonly router = inject(Router);
  private readonly avisos = inject(AvisosService);
  private readonly reservas = inject(ReservaService);
  protected readonly salaService = inject(SalaService);

  /** :id da rota de edição. Na rota de inclusão fica vazio. */
  readonly id = input<string>();
  /** ?sala=dunas, usado pelo botão "Reservar" da tela de salas. */
  readonly sala = input<string>();

  protected readonly horarios = HORARIOS;
  protected readonly editando = computed(() => this.id() !== undefined);
  protected readonly original = this.reservas.recursoPorId(this.id);

  private readonly reservaOriginal = computed(() =>
    this.original.hasValue() ? this.original.value() : null,
  );

  // O modelo do formulário nasce vazio e é refeito quando a reserva da API chega.
  protected readonly modelo = linkedSignal<ReservaCampos>(() => {
    const reserva = this.reservaOriginal();
    if (reserva) return paraCampos(reserva);
    return {
      salaId: this.sala() ?? '',
      responsavel: '',
      finalidade: '',
      participantes: 2,
      data: deIso(hojeIso()),
      inicio: '',
      horas: 1,
      confirmada: false,
    };
  });

  /** Uma reserva antiga pode ser editada sem precisar mudar a data dela. */
  private readonly dataMinima = computed(() => {
    const hoje = deIso(hojeIso());
    const original = this.reservaOriginal()?.data;
    return original && original < hoje ? original : hoje;
  });

  protected readonly formulario = form(
    this.modelo,
    (campos) => {
      required(campos.salaId, { message: 'Escolha uma sala.' });

      required(campos.responsavel, { message: 'Informe o responsável.' });
      minLength(campos.responsavel, 3, { message: 'Use ao menos 3 letras.' });

      maxLength(campos.finalidade, 120, { message: 'Use no máximo 120 caracteres.' });

      required(campos.participantes, { message: 'Informe quantas pessoas vêm.' });
      min(campos.participantes, 1, { message: 'Precisa de ao menos 1 pessoa.' });
      validate(campos.participantes, ({ value, valueOf }) => {
        const sala = this.salaService.porId(valueOf(campos.salaId));
        const pessoas = value();
        return sala && pessoas !== null && pessoas > sala.capacidade
          ? {
              kind: 'capacidade',
              message: `A ${sala.nome} comporta até ${sala.capacidade} pessoas.`,
            }
          : null;
      });

      required(campos.data, { message: 'Escolha uma data.' });
      minDate(campos.data, () => this.dataMinima(), {
        message: 'A data não pode estar no passado.',
      });

      required(campos.inicio, { message: 'Escolha o horário de início.' });

      min(campos.horas, 1, { message: 'A reserva dura ao menos 1 hora.' });
      max(campos.horas, 8, { message: 'A reserva dura no máximo 8 horas.' });
      validate(campos.horas, ({ value, valueOf }) => {
        const inicio = valueOf(campos.inicio);
        return inicio && paraMinutos(inicio) + value() * 60 > FECHAMENTO
          ? { kind: 'fechamento', message: 'A casa fecha às 20:00. Reduza a duração.' }
          : null;
      });

      // Validação assíncrona: pergunta à API se o horário está livre enquanto o usuário preenche.
      validateHttp(campos.inicio, {
        request: ({ value, valueOf }) => {
          const salaId = valueOf(campos.salaId);
          const data = valueOf(campos.data);
          if (!salaId || !data || !value()) return undefined;

          let params = new HttpParams()
            .set('data', paraIso(data))
            .set('inicio', value())
            .set('horas', valueOf(campos.horas));
          if (this.id()) params = params.set('ignorar', this.id()!);
          return { url: `${API_URL}/salas/${salaId}/disponibilidade`, params };
        },
        onSuccess: (resposta: Disponibilidade) =>
          resposta.conflito
            ? {
                kind: 'conflito',
                message: `Ocupada das ${resposta.conflito.inicio} às ${resposta.conflito.fim} por ${resposta.conflito.responsavel}.`,
              }
            : null,
        // Se a checagem falhar, o servidor ainda valida o conflito ao salvar.
        onError: () => null,
      });
    },
    {
      submission: {
        action: async (campos) => {
          const dados = this.modelo() as ReservaDados;
          const id = this.id();
          try {
            const salva = id
              ? await this.reservas.atualizar(Number(id), dados)
              : await this.reservas.criar(dados);
            this.avisos.sucesso(id ? 'Reserva alterada.' : 'Reserva criada.');
            await this.router.navigate(['/reservas', salva.id]);
            return undefined;
          } catch (erro) {
            return errosDoServidor(erro, campos);
          }
        },
      },
    },
  );

  protected readonly salaEscolhida = computed(() => this.salaService.porId(this.modelo().salaId));

  protected readonly horarioLivre = computed(() => {
    const inicio = this.formulario.inicio();
    const { salaId, data } = this.modelo();
    return !!salaId && !!data && !!inicio.value() && !inicio.pending() && inicio.valid();
  });

  protected readonly errosGerais = computed(() =>
    this.formulario()
      .errors()
      .filter((erro) => erro.kind === 'servidor'),
  );

  protected readonly destinoCancelar = computed(() =>
    this.id() ? ['/reservas', this.id()] : ['/reservas'],
  );
}
