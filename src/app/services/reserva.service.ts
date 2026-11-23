import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal, Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FILTROS_INICIAIS, Reserva, ReservaApi, ReservaDados } from '../models/reserva';
import { API_URL } from '../shared/api';
import { deIso, hojeIso, paraIso } from '../shared/datas';
import { AuthService } from './auth.service';

const deApi = (reserva: ReservaApi): Reserva => ({ ...reserva, data: deIso(reserva.data) });
const paraApi = (dados: ReservaDados) => ({ ...dados, data: paraIso(dados.data) });

const chave = (r: Reserva) => `${paraIso(r.data)} ${r.inicio}`;
const ordenar = (lista: Reserva[]) => [...lista].sort((a, b) => chave(a).localeCompare(chave(b)));

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${API_URL}/reservas`;

  private readonly recurso = httpResource<Reserva[]>(
    () => (this.auth.autenticado() ? this.url : undefined),
    { parse: (corpo) => (corpo as ReservaApi[]).map(deApi) },
  );

  readonly reservas = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;
  readonly falhou = computed(() => this.recurso.error() !== undefined);

  // Os filtros sobrevivem à troca de tela e voltam ao padrão quando o usuário muda.
  readonly filtros = linkedSignal({
    source: this.auth.usuario,
    computation: () => FILTROS_INICIAIS,
  });

  readonly filtradas = computed(() => {
    const { busca, salaId, situacao, periodo } = this.filtros();
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    const hoje = hojeIso();

    const lista = this.reservas().filter((r) => {
      const iso = paraIso(r.data);
      return (
        (!termo || `${r.responsavel} ${r.finalidade}`.toLocaleLowerCase('pt-BR').includes(termo)) &&
        (!salaId || r.salaId === salaId) &&
        (situacao === 'todas' || r.confirmada === (situacao === 'confirmadas')) &&
        (periodo === 'todas' || (periodo === 'proximas' ? iso >= hoje : iso < hoje))
      );
    });
    return periodo === 'passadas' ? lista.reverse() : lista;
  });

  readonly pendentes = computed(() => {
    const hoje = hojeIso();
    return this.reservas().filter((r) => !r.confirmada && paraIso(r.data) >= hoje);
  });

  /** Recurso de uma reserva. Deve ser criado no contexto de injeção do componente. */
  recursoPorId(id: Signal<string | undefined>) {
    return httpResource<Reserva>(() => (id() ? `${this.url}/${id()}` : undefined), {
      parse: (corpo) => deApi(corpo as ReservaApi),
    });
  }

  async criar(dados: ReservaDados) {
    const criada = deApi(
      await firstValueFrom(this.http.post<ReservaApi>(this.url, paraApi(dados))),
    );
    this.aplicar((lista) => [...lista, criada]);
    return criada;
  }

  async atualizar(id: number, dados: ReservaDados) {
    const salva = deApi(
      await firstValueFrom(this.http.put<ReservaApi>(`${this.url}/${id}`, paraApi(dados))),
    );
    this.aplicar((lista) => lista.map((r) => (r.id === id ? salva : r)));
    return salva;
  }

  alternarConfirmacao({ id, ...dados }: Reserva) {
    return this.atualizar(id, { ...dados, confirmada: !dados.confirmada });
  }

  async remover(id: number) {
    await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
    this.aplicar((lista) => lista.filter((r) => r.id !== id));
  }

  recarregar() {
    this.recurso.reload();
  }

  private aplicar(mudanca: (lista: Reserva[]) => Reserva[]) {
    if (this.recurso.hasValue()) this.recurso.set(ordenar(mudanca(this.recurso.value())));
    else this.recurso.reload();
  }
}
