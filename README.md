# Acervo Digital

Biblioteca interna de Objetos Digitais de Aprendizagem (ODAs) e audiovisual — busca, filtros e ficha pedagógica para o time de Interações Digitais, NDE e editores (Lançamento 1).

Entrada pelo **login**. Fonte editorial: planilha `public/Categorização_Recursos Digitais_Terceiros.xlsx`. Depois da primeira importação, a aplicação lê o **PostgreSQL**, não a planilha.

**Macroformato `Vídeo`, `Playlist` ou `Áudio`** → **Audiovisual** na UI. Demais macroformatos → **OED**.

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
│   ├── scripts/                  # seed, importação L1 e thumbs
│   ├── lib/                      # Prisma e leitura de Excel
│   └── index.ts
├── public/
│   ├── thumbs/                   # Capas geradas localmente (não versionadas)
│   ├── Categorização_Recursos Digitais_Terceiros.xlsx
│   └── bncc.db
├── docker-compose.yml            # Postgres local :5433
├── package.json
└── README.md
```

Diretrizes de interface: `src/guidelines/Guidelines.md`.

Os canvases de roadmap são documentação local do workspace Cursor e não fazem parte do repositório.

---

## Como os dados funcionam

A planilha **não** é lida a cada abertura do site. O fluxo é:

```
planilha (.xlsx)
    → npm run seed  (ou npm run import:categorizacao)
    → PostgreSQL (metadados, filtros, links)
    → API /api/odas
    → frontend
```

O que fica no banco: título, códigos, BNCC, coleção, livro, bloco, SAMR, requisitos, **caminho da thumb** (`/thumbs/{codigo}.webp`) e **link externo** do ODA/vídeo.

O que **não** fica no banco: o arquivo do ODA, o vídeo e a imagem da capa. Os objetos digitais e vídeos continuam nos repositórios externos (SAE/Vimeo). As capas ficam em `public/thumbs/`.

### Por que as thumbs não vão para o PostgreSQL

São mais de mil imagens. Guardá-las como `BYTEA` no Postgres deixaria o banco pesado, o backup lento e a API mais cara. O banco guarda só o caminho; o arquivo fica no disco. Depois do clone, gere as capas com `npm run thumbs:capture`.

### Atualizar o catálogo quando a planilha oficial mudar

1. Substitua `public/Categorização_Recursos Digitais_Terceiros.xlsx` pela versão oficial.
2. Na raiz: `npm run import:categorizacao`.

A chave de cada registro é o **Código do recurso**. O importador compara um hash da linha e:

| Situação na planilha | O que o código faz |
|----------------------|--------------------|
| Linha nova | Cria o ODA |
| Linha já cadastrada, com alteração | Atualiza os campos no banco |
| Linha já cadastrada, sem alteração | Mantém o registro e só marca a sincronização |
| Código que saiu da planilha | **Desativa** (`ativo = false`); some da galeria, não apaga o histórico |
| Código que voltou depois de sair | Reativa o registro |

Não use `--clear` no dia a dia. Esse modo apaga a tabela `odas` e reimporta tudo; só serve para reset local.

A API lista apenas registros ativos. Favoritos e IDs antigos de itens desativados deixam de aparecer na galeria.

---

## Como rodar

### Pré-requisitos

- Node.js 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Onboarding (primeiro clone)

```bash
npm ci
cd server && npm ci && cd ..
copy server\.env.example server\.env
npm run setup
npm run thumbs:capture
npm run server:dev
```

Em outro terminal:

```bash
npm run dev
```

- App: http://localhost:3000 (`#/login`)
- API: http://localhost:3001

| | |
|--|--|
| **E-mail** | `demo@acervo.local` |
| **Senha** | `demo1234` |

`npm run setup` sobe o Postgres, aplica migrações, importa a BNCC, cria o usuário demo e carrega a planilha no banco.

Conteúdo de `server/.env`:

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

### Thumbs

As thumbs são artefatos locais e não sobem no Git. Em uma instalação nova, gere-as após o seed.

O capturador detecta a tela **“carregando objeto digital”** por texto e assinatura visual. Quando isso acontece, ele aguarda mais e tenta novamente antes de salvar.

```bash
npm run thumbs:capture
```

Para revisar capas existentes e recapturar as que ainda mostram o loader:

```bash
cd server
npx tsx scripts/capture-thumbs.ts --validate-existing
```

Opções: `--wait=12000`, `--retry-wait=20000` e `--loading-retries=2`.

---

## Scripts (raiz)

| Script | Descrição |
|--------|-----------|
| `npm run setup` | Postgres + migrações + seed (BNCC, demo e planilha) |
| `npm run dev` | Frontend (Vite, porta 3000) |
| `npm run build` | Build do frontend |
| `npm run server:dev` | API em watch (porta 3001) |
| `npm run server:build` / `server:start` | Build e start do backend |
| `npm run prisma:generate` | Cliente Prisma |
| `npm run prisma:migrate` | `migrate deploy` |
| `npm run prisma:studio` | Prisma Studio |
| `npm run db:up` / `db:down` / `db:reset` | Docker Postgres |
| `npm run seed` | BNCC + usuário demo + importação da planilha |
| `npm run import:categorizacao` | Sincroniza a planilha com o banco (upsert) |
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

`GET /api/odas` retorna só registros `ativo = true`. Para incluir desativados: `?includeInactive=true`.

---

## Troubleshooting

- **Porta 5432 ocupada:** o Compose usa **5433** de propósito.
- **Prisma / SSL (proxy corporativo):** configure a autoridade certificadora da organização com `NODE_EXTRA_CA_CERTS`; não desative a validação TLS.
- **CORS:** confira `CORS_ORIGIN` em `server/.env`.
- **CSS / classes Tailwind:** o `src/index.css` é compilado e congelado — classes novas muitas vezes não existem; preferir CSS dedicado (ex.: `catalogBadges.css`, `LoginPage.css`).
- **Vimeo no console:** `ERR_BLOCKED_BY_CLIENT` costuma ser bloqueador de ads; o player segue funcionando.
- **Galeria vazia após o clone:** rode `npm run setup` (a planilha precisa estar em `public/`).
- **Cards sem capa:** rode `npm run thumbs:capture`.
