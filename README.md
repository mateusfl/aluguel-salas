# Casa Maré

Sistema de reserva de salas de reunião para a Casa Maré, um espaço fictício num casarão da Ribeira, em Natal/RN. A recepção usa o sistema para acompanhar a agenda das cinco salas e para incluir, alterar, confirmar e remover reservas.

Feito com Angular 22, daisyUI 5 e Tailwind CSS 4. A API usa Bun, Hono, SQLite e JWT.

## Como rodar

```bash
bun install
bun dev
```

O comando sobe o frontend em `http://localhost:4200` e a API em `http://localhost:3333`. Para rodar separadamente, use `bun start` e `bun run api`.

Acesso de demonstração: `recepcao@casamare.example` / `mare1234`.

O banco é criado e populado em `api/casa-mare.sqlite` na primeira execução. Apague esse arquivo para restaurar os dados de exemplo.

## Onde encontrar cada requisito

| Requisito | Onde está |
| --- | --- |
| Modelo com string, number, date e boolean | `src/app/models/reserva.ts` |
| Tema daisyUI e Tailwind | `src/styles.css`, `.postcssrc.json` |
| Componentes | `src/app/layout`, `src/app/pages`, `src/app/shared` |
| Comunicação por signals (`input`, `output`, `model`) | `reservas-lista` com `reservas-filtros` e `reservas-tabela`, `painel` com `agenda-dia` |
| Services com estado | `src/app/services` |
| Signal Forms | `pages/reserva-formulario`, `pages/login` |
| Validação assíncrona e erros do servidor | `validateHttp` e `submission` em `reserva-formulario.ts` |
| Rotas | `src/app/app.routes.ts` |
| HttpClient e `httpResource` | `services/reserva.service.ts`, `services/sala.service.ts` |
| Login e JWT no frontend | `services/auth.service.ts`, `auth.interceptor.ts` |
| Proteção de rotas | `services/auth.guard.ts` |
| Proteção da API | `api/server.ts` |
