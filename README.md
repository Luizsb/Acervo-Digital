# Acervo Digital

Biblioteca interna de Objetos Digitais de Aprendizagem (ODAs) e audiovisual — busca, filtros e ficha pedagógica para o time de Interações Digitais, NDE e editores (Lançamento 1).

Entrada pelo **login**. Fonte única: planilha de categorização local (`public/Categorização_Recursos Digitais_Terceiros.xlsx`), que não é versionada por conter dados editoriais internos.
**Macroformato `Vídeo`, `Playlist` ou `Áudio`** → tratado como **Audiovisual** na UI (abas/filtros). Demais macroformatos → **OED**.

---

## Tecnologias

| Camada | Stack |
|--------|--------|
| **Frontend** | React 18, TypeScript, Vite 6, CSS compilado (Tailwind congelado em `src/index.css`), Radix UI, Lucide React, Intro.js |
| **Backend** | Node.js, Express, TypeScript, Prisma 5, JWT e bcrypt |
| **Banco** | PostgreSQL 16 via Docker Compose (porta **5433** local) |
| **Dados** | ExcelJS, BNCC (`public/bncc.db`) |
| **Thumbs** | Playwright + Sharp (`npm run thumbs:capture`) |
| **Auth (dev)** | Usuário demo local; botão JumpCloud Go como entrada principal na UI (placeholder no ambiente de teste) |

---

## Estrutura

```
Acervo-Digital/
├── src/                          # Frontend (React + Vite)
│   ├── components/               # Galeria, login, filtros, detalhe, UI
│   ├── contexts/                 # Auth
│   ├── hooks/                    # useProjectFilters
│   ├── utils/                    # api, formatters, macroformato, curriculumColors
│   ├── types/                    # Project
│   ├── guidelines/               # Guidelines.md
│   ├── App.tsx
│   └── index.css                 # CSS compilado (não regenerar Tailwind à toa)
├── server/                       # API Express + Prisma
│   ├── prisma/                   # schema + migrations
│   ├── routes/                   # odas, auth, favorites, bncc
│   ├── scripts/                  # seed local, importação L1 e thumbs
│   ├── lib/                      # Prisma e leitura de Excel
│   └── index.ts
├── public/
│   ├── thumbs/                   # Capas locais (geradas; não versionadas)
│   ├── Categorização_Recursos Digitais_Terceiros.xlsx   # Fonte L1 local
│   └── bncc.db
├── docker-compose.yml            # Postgres local :5433
├── package.json                  # Scripts da raiz
└── README.md
```

---

## Roadmap (produto / NDE)

**Fase L1.1 — Localização editorial** (atual): filtros Coleção + Livro + Bloco/Capítulo + Envio à escola.

Os canvases de roadmap e inventário são documentação local do workspace Cursor e
não fazem parte do repositório.

Diretrizes de interface: `src/guidelines/Guidelines.md`.

---

## Como rodar

### Pré-requisitos

- Node.js 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Postgres local)

### 1. Dependências

```bash
npm ci
cd server && npm ci && cd ..
```

### 2. Banco local

```bash
npm run db:up
```

Crie `server/.env` a partir de `server/.env.example`:

```env
DATABASE_URL="postgresql://acervo:acervo@localhost:5433/acervo"
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=sua-chave-secreta-longa-e-aleatoria
JWT_EXPIRES_IN=7d
```

Opcional na raiz: `VITE_API_URL=http://localhost:3001/api`.

Parar / resetar volume:

```bash
npm run db:down
npm run db:reset
```

### 3. Migrações e dados

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

O `seed` importa a BNCC de `public/bncc.db` e cria o usuário demo:

| | |
|--|--|
| **E-mail** | `demo@acervo.local` |
| **Senha** | `demo1234` |

**Importação L1 (planilha de categorização)** — limpa a tabela `odas` e a tabela `audiovisual` legada; recarrega a aba Recursos Digitais. Itens com Macroformato **Vídeo**, **Playlist** ou **Áudio** entram como `tipoConteudo = Audiovisual`:

```bash
cd server
npx tsx scripts/import-categorizacao.ts --clear
```

Ou pela raiz: `npm run import:categorizacao` (sem `--clear` só faz upsert). Para limpar: `cd server && npm run import:categorizacao -- --clear`.

**Thumbs faltantes** (não sobrescreve arquivos que já existem em `public/thumbs/`):

```bash
npm run thumbs:capture
```

As thumbs são artefatos locais e não são enviadas ao Git. Em uma instalação nova,
gere-as após importar os dados.

O capturador detecta a tela **“carregando objeto digital”** por texto e assinatura
visual. Quando isso acontece, ele aguarda mais e tenta novamente antes de salvar.

Para revisar thumbs existentes e recapturar automaticamente as que ainda mostram
o loader:

```bash
cd server
npx tsx scripts/capture-thumbs.ts --validate-existing
```

Opções: `--wait=12000`, `--retry-wait=20000` e `--loading-retries=2`.

### 4. Subir app

**Terminal 1 – API**

```bash
npm run server:dev
```

→ http://localhost:3001

**Terminal 2 – frontend**

```bash
npm run dev
```

→ http://localhost:3000 (`#/login`)

---

## Scripts (raiz)

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Frontend (Vite, porta 3000) |
| `npm run build` | Build do frontend |
| `npm run server:dev` | API em watch (porta 3001) |
| `npm run server:build` / `server:start` | Build e start do backend |
| `npm run prisma:generate` | Cliente Prisma |
| `npm run prisma:migrate` | `migrate deploy` |
| `npm run prisma:studio` | Prisma Studio |
| `npm run db:up` / `db:down` / `db:reset` | Docker Postgres |
| `npm run seed` | BNCC + usuário demo |
| `npm run import:categorizacao` | Import L1 (upsert por código) |
| `npm run thumbs:capture` | Captura thumbs faltantes |
| `npm run test` | Vitest |

---

## API (resumo)

| Área | Endpoints |
|------|-----------|
| **ODAs** | `GET/POST /api/odas`, `GET/PUT/DELETE /api/odas/:id` |
| **Auth** | `POST /api/auth/login`, `register`, `GET/PATCH /api/auth/me` |
| **Favoritos** | `GET/POST /api/users/me/favorites`, `DELETE .../:projectId` |
| **BNCC** | `GET /api/bncc`, `GET /api/bncc/:codigo` |

---

## Troubleshooting

- **Porta 5432 ocupada:** o Compose usa **5433** de propósito (ex.: outro Acervo/Postgres na máquina).
- **Prisma / SSL (proxy corporativo):** configure a autoridade certificadora da organização com `NODE_EXTRA_CA_CERTS`; não desative a validação TLS.
- **CORS:** confira `CORS_ORIGIN` em `server/.env`.
- **CSS / classes Tailwind:** o `src/index.css` é compilado e congelado — classes novas muitas vezes não existem; preferir CSS dedicado (ex.: `catalogBadges.css`, `LoginPage.css`).
- **Vimeo no console:** `ERR_BLOCKED_BY_CLIENT` costuma ser bloqueador de ads; o player segue funcionando.
