import { Database } from 'bun:sqlite';

export interface Sala {
  id: string;
  nome: string;
  andar: string;
  capacidade: number;
  precoHora: number;
  descricao: string;
  recursos: string[];
}

export interface Reserva {
  id: number;
  salaId: string;
  responsavel: string;
  finalidade: string;
  participantes: number;
  data: string; // AAAA-MM-DD
  inicio: string; // HH:mm
  horas: number;
  confirmada: boolean;
}

export type ReservaDados = Omit<Reserva, 'id'>;

interface LinhaReserva extends Omit<Reserva, 'confirmada'> {
  confirmada: number;
}

interface LinhaSala extends Omit<Sala, 'recursos'> {
  recursos: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
}

const db = new Database(new URL('./casa-mare.sqlite', import.meta.url).pathname, { create: true });

db.run(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS salas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    andar TEXT NOT NULL,
    capacidade INTEGER NOT NULL,
    precoHora INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    recursos TEXT NOT NULL
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salaId TEXT NOT NULL REFERENCES salas(id),
    responsavel TEXT NOT NULL,
    finalidade TEXT NOT NULL DEFAULT '',
    participantes INTEGER NOT NULL,
    data TEXT NOT NULL,
    inicio TEXT NOT NULL,
    horas INTEGER NOT NULL,
    confirmada INTEGER NOT NULL DEFAULT 0
  )
`);

const SALAS: Sala[] = [
  {
    id: 'potengi',
    nome: 'Sala Potengi',
    andar: 'Térreo',
    capacidade: 4,
    precoHora: 45,
    descricao:
      'Pequena e silenciosa, com janela para o rio. Boa para entrevistas e conversas a dois.',
    recursos: ['TV 43"', 'Wi-Fi', 'Café'],
  },
  {
    id: 'dunas',
    nome: 'Sala Dunas',
    andar: '1º andar',
    capacidade: 8,
    precoHora: 70,
    descricao:
      'Mesa redonda de madeira e luz natural o dia inteiro. Feita para decisões em equipe.',
    recursos: ['TV 55"', 'Quadro branco', 'Wi-Fi', 'Café'],
  },
  {
    id: 'ponta-negra',
    nome: 'Sala Ponta Negra',
    andar: '1º andar',
    capacidade: 12,
    precoHora: 95,
    descricao: 'Paredes riscáveis e mobília leve para workshops, sprints e sessões de design.',
    recursos: ['Projetor', 'Parede riscável', 'Wi-Fi', 'Café'],
  },
  {
    id: 'atlantico',
    nome: 'Sala Atlântico',
    andar: '2º andar',
    capacidade: 16,
    precoHora: 130,
    descricao: 'A sala de diretoria da casa, com varanda e vista para o mar ao fundo.',
    recursos: ['Videoconferência', 'TV 75"', 'Varanda', 'Wi-Fi', 'Café'],
  },
  {
    id: 'auditorio-natal',
    nome: 'Auditório Natal',
    andar: '2º andar',
    capacidade: 40,
    precoHora: 220,
    descricao: 'Nosso maior espaço, com palco baixo e som próprio para palestras e lançamentos.',
    recursos: ['Projetor', 'Som', 'Microfones', 'Wi-Fi'],
  },
];

function dataRelativa(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return dataLocal(data);
}

export function dataLocal(data = new Date()): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function popular() {
  const { total } = db.query('SELECT COUNT(*) AS total FROM usuarios').get() as { total: number };
  if (total > 0) return;

  db.query('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)').run(
    'Marina Tavares',
    'recepcao@casamare.example',
    Bun.password.hashSync('mare1234'),
  );

  const inserirSala = db.query(
    'INSERT INTO salas (id, nome, andar, capacidade, precoHora, descricao, recursos) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  for (const s of SALAS) {
    inserirSala.run(
      s.id,
      s.nome,
      s.andar,
      s.capacidade,
      s.precoHora,
      s.descricao,
      JSON.stringify(s.recursos),
    );
  }

  const exemplos: [string, string, string, number, number, string, number, boolean][] = [
    ['atlantico', 'Ana Souza', 'Conselho trimestral da Oceânica Pesca', 12, 0, '09:00', 3, true],
    ['potengi', 'Bruno Lima', 'Entrevistas para desenvolvedor', 3, 0, '10:00', 2, true],
    ['ponta-negra', 'Carla Medeiros', 'Sprint de design do app Rota Sol', 9, 0, '13:00', 4, false],
    ['dunas', 'Diego Fernandes', 'Planejamento de marketing', 6, 0, '14:30', 2, true],
    [
      'auditorio-natal',
      'Elisa Rocha',
      'Lançamento da Cooperativa Maresia',
      35,
      1,
      '18:00',
      2,
      true,
    ],
    ['dunas', 'Felipe Araújo', 'Mentoria de startups', 5, 1, '09:00', 2, false],
    ['potengi', 'Gabi Nóbrega', 'Atendimento jurídico', 2, 2, '15:00', 1, true],
    ['atlantico', 'Heitor Dantas', 'Negociação com fornecedores', 8, 3, '10:00', 2, false],
    ['ponta-negra', 'Iara Bezerra', 'Oficina de escrita criativa', 12, 5, '08:30', 4, true],
    ['auditorio-natal', 'João Galvão', 'Palestra sobre energia eólica', 38, 8, '19:00', 1, false],
    ['dunas', 'Karina Melo', 'Retrospectiva do time', 7, -2, '16:00', 2, true],
    ['potengi', 'Lucas Praxedes', 'Consultoria financeira', 2, -1, '11:00', 1, true],
  ];

  for (const [
    salaId,
    responsavel,
    finalidade,
    participantes,
    dias,
    inicio,
    horas,
    confirmada,
  ] of exemplos) {
    criarReserva({
      salaId,
      responsavel,
      finalidade,
      participantes,
      data: dataRelativa(dias),
      inicio,
      horas,
      confirmada,
    });
  }
}

const paraReserva = (l: LinhaReserva): Reserva => ({ ...l, confirmada: l.confirmada === 1 });

export const buscarUsuario = (email: string) =>
  db.query('SELECT * FROM usuarios WHERE email = ?').get(email) as Usuario | null;

export const listarSalas = () =>
  (db.query('SELECT * FROM salas ORDER BY capacidade').all() as LinhaSala[]).map((l) => ({
    ...l,
    recursos: JSON.parse(l.recursos) as string[],
  }));

export const buscarSala = (id: string) => listarSalas().find((s) => s.id === id) ?? null;

export const listarReservas = () =>
  (db.query('SELECT * FROM reservas ORDER BY data, inicio').all() as LinhaReserva[]).map(
    paraReserva,
  );

export function buscarReserva(id: number) {
  const linha = db.query('SELECT * FROM reservas WHERE id = ?').get(id) as LinhaReserva | null;
  return linha ? paraReserva(linha) : null;
}

export const reservasDaSala = (salaId: string, data: string) =>
  (
    db
      .query('SELECT * FROM reservas WHERE salaId = ? AND data = ?')
      .all(salaId, data) as LinhaReserva[]
  ).map(paraReserva);

export function criarReserva(r: ReservaDados) {
  const { id } = db
    .query(
      `INSERT INTO reservas (salaId, responsavel, finalidade, participantes, data, inicio, horas, confirmada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    )
    .get(
      r.salaId,
      r.responsavel,
      r.finalidade,
      r.participantes,
      r.data,
      r.inicio,
      r.horas,
      r.confirmada ? 1 : 0,
    ) as {
    id: number;
  };
  return buscarReserva(id)!;
}

export function atualizarReserva(id: number, r: ReservaDados) {
  db.query(
    `UPDATE reservas SET salaId = ?, responsavel = ?, finalidade = ?, participantes = ?, data = ?, inicio = ?, horas = ?, confirmada = ?
     WHERE id = ?`,
  ).run(
    r.salaId,
    r.responsavel,
    r.finalidade,
    r.participantes,
    r.data,
    r.inicio,
    r.horas,
    r.confirmada ? 1 : 0,
    id,
  );
  return buscarReserva(id)!;
}

export const removerReserva = (id: number) =>
  db.query('DELETE FROM reservas WHERE id = ?').run(id).changes > 0;

popular();
