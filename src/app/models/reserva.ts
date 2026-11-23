/** Modelo principal: string, number, date e boolean. */
export interface Reserva {
  id: number;
  salaId: string;
  responsavel: string;
  finalidade: string;
  participantes: number;
  data: Date;
  inicio: string;
  horas: number;
  confirmada: boolean;
}

export type ReservaDados = Omit<Reserva, 'id'>;

/** Na API a data trafega como texto AAAA-MM-DD. */
export interface ReservaApi extends Omit<Reserva, 'data'> {
  data: string;
}

/** Valores do formulário: número e data podem estar vazios enquanto o usuário preenche. */
export interface ReservaCampos extends Omit<ReservaDados, 'participantes' | 'data'> {
  participantes: number | null;
  data: Date | null;
}

export interface FiltrosReserva {
  busca: string;
  salaId: string;
  situacao: 'todas' | 'confirmadas' | 'pendentes';
  periodo: 'proximas' | 'passadas' | 'todas';
}

export const FILTROS_INICIAIS: FiltrosReserva = {
  busca: '',
  salaId: '',
  situacao: 'todas',
  periodo: 'proximas',
};

export interface Disponibilidade {
  disponivel: boolean;
  conflito: { inicio: string; fim: string; responsavel: string } | null;
}
