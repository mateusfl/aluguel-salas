import { buscarSala, dataLocal, reservasDaSala, type Reserva, type ReservaDados } from './db';

export interface ErroCampo {
  campo: keyof ReservaDados;
  mensagem: string;
}

const ABERTURA = 8 * 60;
const FECHAMENTO = 20 * 60;

export const paraMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

const dataValida = (data: unknown): data is string =>
  typeof data === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(data) &&
  !Number.isNaN(Date.parse(`${data}T00:00:00Z`)) &&
  new Date(`${data}T00:00:00Z`).toISOString().startsWith(data);

const horaValida = (hora: unknown): hora is string =>
  typeof hora === 'string' && /^([01]\d|2[0-3]):(00|30)$/.test(hora);

export function buscarConflito(
  salaId: string,
  data: string,
  inicio: string,
  horas: number,
  ignorarId?: number,
) {
  const comeco = paraMinutos(inicio);
  const fim = comeco + horas * 60;
  return (
    reservasDaSala(salaId, data).find((r) => {
      if (r.id === ignorarId) return false;
      const outroComeco = paraMinutos(r.inicio);
      return comeco < outroComeco + r.horas * 60 && outroComeco < fim;
    }) ?? null
  );
}

/** Valida o corpo recebido. O frontend valida também, mas a regra que vale é a do servidor. */
export function validarReserva(
  corpo: Record<string, unknown>,
  atual?: Reserva,
): { dados: ReservaDados; erros: [] } | { dados: null; erros: ErroCampo[] } {
  const erros: ErroCampo[] = [];
  const responsavel = typeof corpo['responsavel'] === 'string' ? corpo['responsavel'].trim() : '';
  const finalidade = typeof corpo['finalidade'] === 'string' ? corpo['finalidade'].trim() : '';
  const { salaId, participantes, data, inicio, horas, confirmada } = corpo;

  const sala = typeof salaId === 'string' ? buscarSala(salaId) : null;
  if (!sala) erros.push({ campo: 'salaId', mensagem: 'Escolha uma sala válida.' });

  if (responsavel.length < 3) {
    erros.push({ campo: 'responsavel', mensagem: 'Informe o nome do responsável.' });
  }
  if (finalidade.length > 120) {
    erros.push({ campo: 'finalidade', mensagem: 'Use no máximo 120 caracteres.' });
  }
  if (!Number.isInteger(participantes) || (participantes as number) < 1) {
    erros.push({ campo: 'participantes', mensagem: 'Informe ao menos 1 participante.' });
  } else if (sala && (participantes as number) > sala.capacidade) {
    erros.push({
      campo: 'participantes',
      mensagem: `A ${sala.nome} comporta até ${sala.capacidade} pessoas.`,
    });
  }

  if (!dataValida(data)) {
    erros.push({ campo: 'data', mensagem: 'Informe uma data válida.' });
  } else if (data < dataLocal() && data !== atual?.data) {
    erros.push({ campo: 'data', mensagem: 'A data não pode estar no passado.' });
  }

  if (!Number.isInteger(horas) || (horas as number) < 1 || (horas as number) > 8) {
    erros.push({ campo: 'horas', mensagem: 'A duração deve ser de 1 a 8 horas.' });
  }

  if (!horaValida(inicio)) {
    erros.push({ campo: 'inicio', mensagem: 'Escolha um horário de início.' });
  } else if (paraMinutos(inicio) < ABERTURA) {
    erros.push({ campo: 'inicio', mensagem: 'A casa abre às 08:00.' });
  } else if (Number.isInteger(horas) && paraMinutos(inicio) + (horas as number) * 60 > FECHAMENTO) {
    erros.push({ campo: 'horas', mensagem: 'A reserva precisa terminar até as 20:00.' });
  }

  if (typeof confirmada !== 'boolean') {
    erros.push({ campo: 'confirmada', mensagem: 'Situação inválida.' });
  }

  if (erros.length > 0) return { dados: null, erros };

  return {
    dados: {
      salaId: salaId as string,
      responsavel,
      finalidade,
      participantes: participantes as number,
      data: data as string,
      inicio: inicio as string,
      horas: horas as number,
      confirmada: confirmada as boolean,
    },
    erros: [],
  };
}
