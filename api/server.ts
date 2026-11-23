import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import {
  atualizarReserva,
  buscarReserva,
  buscarSala,
  buscarUsuario,
  criarReserva,
  listarReservas,
  listarSalas,
  removerReserva,
} from './db';
import { buscarConflito, paraMinutos, validarReserva } from './regras';

// Sem JWT_SECRET, cada início da API gera um segredo novo e as sessões antigas expiram.
const SEGREDO = process.env['JWT_SECRET'] ?? crypto.randomUUID();
const OITO_HORAS = 8 * 60 * 60;

const app = new Hono().basePath('/api');

app.use(
  '*',
  cors({ origin: 'http://localhost:4200', allowHeaders: ['Authorization', 'Content-Type'] }),
);

app.post('/auth/login', async (c) => {
  const corpo = await c.req.json().catch(() => ({}));
  const email = typeof corpo.email === 'string' ? corpo.email.trim().toLowerCase() : '';
  const senha = typeof corpo.senha === 'string' ? corpo.senha : '';
  const usuario = buscarUsuario(email);

  if (!usuario || !(await Bun.password.verify(senha, usuario.senha_hash))) {
    return c.json({ mensagem: 'E-mail ou senha incorretos.' }, 401);
  }

  const exp = Math.floor(Date.now() / 1000) + OITO_HORAS;
  const token = await sign(
    { sub: String(usuario.id), nome: usuario.nome, email: usuario.email, exp },
    SEGREDO,
    'HS256',
  );
  return c.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});

// Tudo que vem depois desta linha exige um token válido.
app.use('*', jwt({ secret: SEGREDO, alg: 'HS256' }));

app.get('/salas', (c) => c.json(listarSalas()));

app.get('/salas/:id/disponibilidade', (c) => {
  const sala = buscarSala(c.req.param('id'));
  if (!sala) return c.json({ mensagem: 'Sala não encontrada.' }, 404);

  const { data, inicio, horas, ignorar } = c.req.query();
  if (!data || !/^\d{2}:\d{2}$/.test(inicio ?? '') || !Number(horas)) {
    return c.json({ mensagem: 'Informe data, início e horas.' }, 400);
  }

  const conflito = buscarConflito(
    sala.id,
    data,
    inicio,
    Number(horas),
    ignorar ? Number(ignorar) : undefined,
  );
  if (!conflito) return c.json({ disponivel: true, conflito: null });

  const fimMinutos = paraMinutos(conflito.inicio) + conflito.horas * 60;
  const fim = `${String(Math.floor(fimMinutos / 60)).padStart(2, '0')}:${String(fimMinutos % 60).padStart(2, '0')}`;
  return c.json({
    disponivel: false,
    conflito: { inicio: conflito.inicio, fim, responsavel: conflito.responsavel },
  });
});

app.get('/reservas', (c) => c.json(listarReservas()));

app.get('/reservas/:id', (c) => {
  const reserva = buscarReserva(Number(c.req.param('id')));
  return reserva ? c.json(reserva) : c.json({ mensagem: 'Reserva não encontrada.' }, 404);
});

const erroDeConflito = {
  campo: 'inicio',
  mensagem: 'Este horário acabou de ser ocupado nesta sala.',
};

app.post('/reservas', async (c) => {
  const corpo = await c.req.json().catch(() => ({}));
  const { dados, erros } = validarReserva(corpo);
  if (!dados) return c.json({ erros }, 422);
  if (buscarConflito(dados.salaId, dados.data, dados.inicio, dados.horas)) {
    return c.json({ erros: [erroDeConflito] }, 409);
  }
  return c.json(criarReserva(dados), 201);
});

app.put('/reservas/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const atual = buscarReserva(id);
  if (!atual) return c.json({ mensagem: 'Reserva não encontrada.' }, 404);

  const corpo = await c.req.json().catch(() => ({}));
  const { dados, erros } = validarReserva(corpo, atual);
  if (!dados) return c.json({ erros }, 422);
  if (buscarConflito(dados.salaId, dados.data, dados.inicio, dados.horas, id)) {
    return c.json({ erros: [erroDeConflito] }, 409);
  }
  return c.json(atualizarReserva(id, dados));
});

app.delete('/reservas/:id', (c) => {
  const removida = removerReserva(Number(c.req.param('id')));
  return removida ? c.body(null, 204) : c.json({ mensagem: 'Reserva não encontrada.' }, 404);
});

export default { port: 3333, hostname: 'localhost', fetch: app.fetch };
