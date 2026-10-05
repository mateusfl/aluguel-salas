export interface Reserva {
  id: number;
  sala: string; // string
  responsavel: string; // string
  participantes: number; // number
  data: Date; // date
  confirmada: boolean; // boolean
}

export const SALAS = ['Sala Atlântico', 'Sala Potengi', 'Sala Ponta Negra', 'Sala Dunas', 'Auditório Natal'];
