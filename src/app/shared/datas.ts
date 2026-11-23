// As datas de reserva não têm fuso: ficam em meia-noite UTC, como o <input type="date"> entrega.

export const ABERTURA = 8 * 60;
export const FECHAMENTO = 20 * 60;

export const paraIso = (data: Date) => data.toISOString().slice(0, 10);
export const deIso = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function hojeIso() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function somarDias(iso: string, dias: number) {
  const data = deIso(iso);
  data.setUTCDate(data.getUTCDate() + dias);
  return paraIso(data);
}

export function paraMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function paraHora(minutos: number) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export const horaFinal = (inicio: string, horas: number) =>
  paraHora(paraMinutos(inicio) + horas * 60);

/** Horários de início disponíveis, de 30 em 30 minutos. */
export const HORARIOS = Array.from({ length: 24 }, (_, i) => paraHora(ABERTURA + i * 30));
