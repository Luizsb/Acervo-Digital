# Acervo Digital

Biblioteca interna de Objetos Digitais de Aprendizagem (ODAs) e audiovisual — busca, filtros e ficha pedagógica para o time de Interações Digitais, NDE e editores (Lançamento 1).

Entrada pelo **login**. Fonte editorial: planilha `public/Categorização_Recursos Digitais_Terceiros.xlsx`. Depois da primeira importação, a aplicação lê o **PostgreSQL**, não a planilha.

**Macroformato `Vídeo`, `Playlist` ou `Áudio`** → **Audiovisual** na UI. Demais macroformatos → **OED**.

Roadmap: [ROADMAP.md](./ROADMAP.md).

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
├── server/                       # API Express + Prisma
│   ├── Dockerfile                # Imagem da API
│   └── docker-entrypoint.sh      # migrate + seed + start
├── public/
│   ├── thumbs/                   # Capas geradas localmente (não versionadas)
│   ├── Categorização_Recursos Digitais_Terceiros.xlsx
│   └── bncc.db
├── docker/
│   └── nginx.conf                # Frontend em container
├── Dockerfile                    # Imagem do frontend
├── docker-compose.yml            # Postgres + API + frontend
├── ROADMAP.md
└── README.md
```

Diretrizes de interface: `src/guidelines/Guidelines.md`.

---

## Como os dados funcionam

A planilha **não** é lida a cada abertura do site. O fluxo é:

```
planilha (.xlsx)
    → seed / import:categorizacao  (também no start da API em Docker)
    → PostgreSQL
    → API /api/odas
    → frontend
```

O que fica no banco: título, códigos, BNCC, coleção, livro, bloco, SAMR, requisitos, **caminho da thumb** (`/thumbs/{codigo}.webp`) e **link externo** do ODA/vídeo.

O que **não** fica no banco: o arquivo do ODA, o vídeo e a imagem da capa. As capas ficam em `public/thumbs/`.

### Por que as thumbs não vão para o PostgreSQL

São mais de mil imagens. Guardá-las como `BYTEA` deixaria o banco pesado. O banco guarda só o caminho; o arquivo fica no disco. Depois do clone, gere as capas com `npm run thumbs:capture`.

### Atualizar o catálogo quando a planilha oficial mudar

1. Substitua `public/Categorização_Recursos Digitais_Terceiros.xlsx` pela versão oficial.
2. Rode `npm run import:categorizacao` (dev local) ou `docker compose up --build -d` (a API semeia na subida).

A chave é o **Código do recurso**:

| Situação na planilha | O que o código faz |
|----------------------|--------------------|
| Linha nova | Cria o ODA |
| Linha já cadastrada, com alteração | Atualiza os campos no banco |
| Linha já cadastrada, sem alteração | Mantém o registro e só marca a sincronização |
| Código que saiu da planilha | **Desativa** (`ativo = false`); some da galeria |
| Código que voltou depois de sair | Reativa o registro |

Não use `--clear` no dia a dia.

---

## Como rodar

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 20+ só é necessário para gerar thumbs ou desenvolver o frontend com Vite

### Caminho recomendado (clone novo)

Sobe **PostgreSQL, API e frontend** já migrados e com a planilha importada:

```bash
docker compose up --build -d
```

- App: http://localhost:3000
- API: http://localhost:3001/health

| | |
|--|--|
| **E-mail** | `demo@acervo.local` |
| **Senha** | `demo1234` |

A primeira subida demora: a API aplica migrações e importa o catálogo. Se a porta 3000 ou 3001 já estiver em uso (`npm run dev` / `npm run server:dev`), encerre esses processos antes.

Thumbs continuam locais:

```bash
npm ci
cd server && npm ci && cd ..
npm run thumbs:capture
```

### Desenvolvimento local (API e Vite na máquina)

```bash
npm ci
cd server && npm ci && cd ..
copy server\.env.example server\.env
npm run setup
npm run server:dev
```

Em outro terminal: `npm run dev`.

`npm run setup` sobe **apenas o Postgres**, aplica migrações e importa a planilha. A API e o frontend rodam no Node local.

Conteúdo de `server/.env` para esse modo:

```env
DATABASE_URL="postgresql://acervo:acervo@localhost:5433/acervo"
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=sua-chave-secreta-longa-e-aleatoria
JWT_EXPIRES_IN=7d
```

Parar os containers:

```bash
npm run docker:down
```

Resetar o volume do banco:

```bash
npm run db:reset
```

### Thumbs

As thumbs não sobem no Git. Em uma instalação nova, gere-as após o catálogo existir no banco.

```bash
npm run thumbs:capture
```

Para recapturar capas com tela de carregamento:

```bash
cd server
npx tsx scripts/capture-thumbs.ts --validate-existing
```

---

## Scripts (raiz)

| Script | Descrição |
|--------|-----------|
| `npm run docker:up` | Postgres + API + frontend em Docker |
| `npm run docker:down` | Para os containers |
| `npm run setup` | Postgres + migrações + seed (API local) |
| `npm run dev` | Frontend Vite (porta 3000) |
| `npm run build` | Build do frontend |
| `npm run server:dev` | API local em watch (porta 3001) |
| `npm run prisma:generate` | Cliente Prisma |
| `npm run prisma:migrate` | `migrate deploy` |
| `npm run prisma:studio` | Prisma Studio |
| `npm run db:up` / `db:down` / `db:reset` | Só o Postgres |
| `npm run seed` | BNCC + usuário demo + planilha |
| `npm run import:categorizacao` | Sincroniza a planilha com o banco |
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
- **Portas 3000/3001 ocupadas:** encerre Vite/API locais antes de `docker compose up`.
- **Prisma / SSL (proxy corporativo):** `NODE_EXTRA_CA_CERTS`; não desative a validação TLS.
- **CORS:** confira `CORS_ORIGIN`.
- **CSS / classes Tailwind:** o `src/index.css` é compilado e congelado; preferir CSS dedicado.
- **Vimeo no console:** `ERR_BLOCKED_BY_CLIENT` costuma ser bloqueador de ads.
- **Galeria vazia:** no Docker, aguarde o seed da API; no modo local, rode `npm run setup`.
- **Cards sem capa:** `npm run thumbs:capture`.
