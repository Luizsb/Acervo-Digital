# Acervo Digital

Biblioteca interna de Objetos Digitais de Aprendizagem (ODAs) e audiovisual — busca, filtros e ficha pedagógica para o time de Interações Digitais, NDE e editores (Lançamento 1).

Entrada pelo **login**. Fonte editorial: planilha `data/Categorização_Recursos Digitais_Terceiros.xlsx`, que fica **fora do Git e fora de `public/`** (contém dados pessoais e recursos não publicáveis). Depois da primeira importação, a aplicação lê o **PostgreSQL**, não a planilha.

**Macroformato `Vídeo`, `Playlist` ou `Áudio`** → **Audiovisual** na UI. Demais macroformatos → **OED**.

---

## Documentação

Este README cuida de **instalação, comandos e solução de problemas**. O entendimento
do projeto está em `docs/`, no padrão [D.N.E.E. Docs](./.cursorrules):

| Arquivo | O que traz |
|---------|-----------|
| [docs/SOBRE.md](./docs/SOBRE.md) | Visão de negócio: problema, público, valor, momento atual |
| [docs/SDD.md](./docs/SDD.md) | Arquitetura, regras de negócio e **a rotina de operação (runbook)** |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Fases, backlog, bugs conhecidos e débitos técnicos |
| [docs/CHANGELOG_EVIDENCES.md](./docs/CHANGELOG_EVIDENCES.md) | Decisões tomadas e evidências de entrega |
| [docs/visao-projeto.html](./docs/visao-projeto.html) | Interface visual que reúne os quatro arquivos acima |

### Como ler a documentação

**Direto no GitHub ou no editor.** Os quatro arquivos são Markdown comum: basta
clicar nos links da tabela acima. É o caminho mais rápido e não exige instalar nada.

**Na interface visual, com as quatro abas.** A página `docs/visao-projeto.html` lê os
Markdown em tempo de execução e os apresenta num painel único, com tema claro e
escuro. Ela precisa ser servida por HTTP — abrir o arquivo direto do disco não
funciona, porque o navegador bloqueia a leitura de arquivos locais:

```bash
npx serve docs -l 4000
```

Depois abra **http://localhost:4000/visao-projeto.html**. A porta 4000 evita
conflito com o Vite, que usa a 3000. A extensão *Live Server* do VS Code também
resolve: clique com o botão direito no arquivo e escolha *Open with Live Server*.

Não há build nem dependência a instalar: a página é um HTML único.

**Por onde começar.** Se você acabou de assumir o projeto, vá para a seção *Rotina de
operação* do [SDD.md](./docs/SDD.md) — é o que mantém o catálogo atualizado. Depois
leia o [SOBRE.md](./docs/SOBRE.md) para entender o produto.

### Como manter a documentação

Os arquivos `.md` são a **fonte da verdade**; a página HTML só os exibe. Toda mudança
relevante de comportamento, dado, regra, fluxo ou infraestrutura precisa atualizar o
Markdown correspondente e registrar a entrega em
[CHANGELOG_EVIDENCES.md](./docs/CHANGELOG_EVIDENCES.md). O processo completo, que a
IA do Cursor é obrigada a seguir neste repositório, está no
[.cursorrules](./.cursorrules).

> **Onde o projeto está hospedado hoje:** front na **Vercel**, banco e autenticação
> no **Supabase** (`VITE_BACKEND=supabase`). A publicação na EC2 (imagens Docker,
> nginx, Caddy e scripts de deploy) foi removida em 2026-10-20. O `server/` continua:
> é a API local e o caminho da importação. O Docker sobe só o Postgres de desenvolvimento.

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
├── docs/                         # Documentação D.N.E.E (fonte da verdade)
│   ├── SOBRE.md                  # Visão de produto
│   ├── SDD.md                    # Norte técnico + runbook de operação
│   ├── ROADMAP.md                # Planejamento e débitos
│   ├── CHANGELOG_EVIDENCES.md    # Decisões e evidências
│   └── visao-projeto.html        # Interface visual de leitura
├── src/                          # Frontend (React + Vite)
├── server/                       # API Express + Prisma (local; não é a EC2)
├── public/
│   ├── thumbs/                   # Capas webp versionadas (~60 MB)
│   └── bncc.db
├── data/                         # Planilha de categorização (fora do Git)
├── scripts/
│   ├── supabase/rls.sql          # Políticas e funções do Supabase
│   └── apps-script/              # Gatilho de sincronização (parado; apontava para a EC2)
├── docker-compose.yml            # Só o Postgres local
├── .cursorrules                  # Processo que a IA segue no repositório
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

O que **não** fica no banco: o arquivo do ODA e o vídeo. As capas ficam em `public/thumbs/` e sobem no Git (WebP, cerca de 60 MB).

### Por que as thumbs não vão para o PostgreSQL

São mais de mil imagens. Guardá-las como `BYTEA` deixaria o banco pesado. O banco guarda só o caminho (`/thumbs/{codigo}.webp`); o arquivo vai no disco e no repositório.

### Atualizar o catálogo quando a planilha oficial mudar

**Opção A — Apps Script agendado (recomendado):** funciona com a planilha privada,
porque o script roda com a conta que criou o acionador.

1. No `.env` da API: `SPREADSHEET_SYNC_TOKEN=` (`openssl rand -hex 32`)
2. Planilha → Extensões → Apps Script → cole `scripts/apps-script/sync-acervo.gs`
3. O endereço da API já está preenchido. Em **Configurações do projeto → Propriedades do script**, cadastre apenas `SYNC_TOKEN` com o mesmo valor do `.env`; depois autorize rodando `testSyncNow`
4. Acionadores → novo acionador para `syncAcervoDaily`, baseado em tempo, temporizador diário (recomendado) ou semanal
5. Endpoints usados: `POST /api/sync/spreadsheet` (responde `202` com `jobId`) e `GET /api/sync/jobs/:jobId`, com header `X-Acervo-Sync-Token`
6. Capas: por padrão a sincronização captura as elegíveis (até `AUTO_CAPTURE_THUMBS_LIMIT`, 50 por execução). Use `AUTO_CAPTURE_THUMBS_AFTER_SYNC=false` para deixar só sob demanda

Não é necessário implantar o Apps Script como App da Web. No painel admin ficam o
upload manual de `.xlsx` e a data/origem da última sincronização concluída. O gatilho
apontava para a API da EC2 e está parado.

**Opção B — arquivo manual:** baixe a planilha do Drive do NDE e rode
`npm run planilha:preparar -- "caminho/do/arquivo-baixado.xlsx"`, que grava em
`data/` só a aba `Recursos Digitais`, sem dados pessoais. Depois rode
`npm run import:categorizacao`. No Docker, `./data` é montado na API.

O feedback (tela admin ou terminal) mostra novos, atualizados, desativados e recursos sem thumb.

Para comparar a planilha nova com a última importada sem tocar no banco: `npm run diff:planilha`.

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

- Node.js 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), só para o Postgres local. Consultar o catálogo de testes não precisa dele: use `VITE_BACKEND=supabase` e `npm run dev`.

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

| | |
|--|--|
| **Acervo** | `demo@acervo.local` / `demo1234` (botão Acessar o acervo) |
| **Admin (provisório)** | `admin@acervo.local` / `admin1234` (botão Acesso admin) |

- App: http://localhost:3000
- API: http://localhost:3001/health

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

As capas WebP ficam em `public/thumbs/` e vão no Git. Depois do clone, a galeria já tem imagem. Para gerar o que faltar:

```bash
npm run thumbs:setup # uma vez no desenvolvimento local
npm run thumbs:capture
```

Para recapturar capas com tela de carregamento:

```bash
cd server
npx tsx scripts/capture-thumbs.ts --validate-existing
```

### Graphify (mapa do código)

O [Graphify](https://github.com/Graphify-Labs/graphify) gera um grafo consultável do
código, para humanos e agentes de IA se orientarem no projeto. É ferramenta local de
desenvolvimento: não entra no `package.json`, no build nem no deploy. Precisa de Python
3.10+ e do [uv](https://docs.astral.sh/uv/).

```bash
uv tool install "graphifyy[sql]"      # o pacote PyPI tem dois "y"
graphify install --platform cursor    # cria .cursor/rules/graphify.mdc (local, fora do Git)
graphify extract . --code-only        # grafo só do código, análise local, sem LLM
graphify cluster-only . --no-label    # gera graphify-out/GRAPH_REPORT.md e graph.html
graphify update .                     # depois de mudar código; também sem LLM
graphify query "como a planilha chega ao banco"
```

Cuidados, por causa dos dados e do relatório de segurança:

- `.graphifyignore` tira do grafo `data/` (planilha e exports), `public/thumbs/`,
  `.env` e artefatos. `graphify-out/` fica fora do Git.
- A extração completa (sem `--code-only`) envia documentos e imagens para um LLM. Use
  só conscientemente.
- **Nunca** use `--postgres` com a conexão do Supabase: a senha do banco iria para a
  linha de comando e o esquema real, para o grafo.
- Não instale `graphify hook install` nem rode `--watch`: os dois reprocessam tudo
  automaticamente.

---

## Publicação

O front publica na Vercel a cada push em main. O banco é o Supabase.
A EC2, o nginx, o Caddy e as imagens Docker foram removidos em 2026-10-20;
quando houver servidor corporativo, o empacotamento é feito de novo.
A operação do catálogo está no [SDD.md](./docs/SDD.md).

## Scripts (raiz)

| Script | Descrição |
|--------|-----------|
| `npm run docker:down` | Para o Postgres local |
| `npm run setup` | Postgres + migrações + seed (API local) |
| `npm run dev` | Frontend Vite (porta 3000) |
| `npm run build` | Build do frontend |
| `npm run server:dev` | API local em watch (porta 3001) |
| `npm run prisma:generate` | Cliente Prisma |
| `npm run prisma:migrate` | Aplica as migrações pendentes (`migrate deploy`). Para criar migração nova: `cd server && npm run prisma:migrate:dev` |
| `npm run prisma:studio` | Prisma Studio |
| `npm run db:up` / `db:reset` | Sobe ou recria só o Postgres. Para parar, `npm run docker:down` |
| `npm run seed` | BNCC + usuários demo/admin + planilha |
| `npm run import:categorizacao` | Sincroniza a planilha com o banco |
| `npm run import:categorizacao:com-capa` | Igual, mas adia recurso novo visível que ainda não tem capa |
| `npm run planilha:preparar -- "arquivo.xlsx"` | Prepara a planilha baixada do Drive: só a aba Recursos Digitais, sem dados pessoais, em `data/` |
| `npm run diff:planilha` | Compara a planilha de `data/` com a última importada |
| `npm run db:exportar` | Exporta o banco em JSON para `data/export-*` (migração e backup; contém dado pessoal) |
| `npm run thumbs:setup` | Instala o Chromium para captura local |
| `npm run thumbs:capture` | Captura as capas que faltam, lendo a lista da planilha. Opções: `-- --limit=100`, `-- --do-banco` |
| `npm run test` | Vitest |

---

## API (resumo)

| Área | Endpoints |
|------|-----------|
| **ODAs** | `GET/POST /api/odas`, `GET/PUT/DELETE /api/odas/:id` |
| **Auth** | `POST /api/auth/login`, `register`, `GET/PATCH /api/auth/me` |
| **Admin** | `GET /api/admin/review` (JWT com `role=admin`; fila do que não entra na galeria) |
| **Favoritos** | `GET/POST /api/users/me/favorites`, `DELETE .../:projectId` |
| **BNCC** | `GET /api/bncc`, `GET /api/bncc/:codigo` |

`GET /api/odas` retorna só registros `ativo = true` com **Status do link = Funcionando** e **Link do recurso preenchido**. Em branco, acesso restrito, quebrado, incorreto, não avaliado, dúvida para revisão e itens sem link ficam no banco para o painel admin e não entram na galeria. Um recurso marcado como Funcionando mas sem link aparece na fila de revisão no grupo **Sem link**. Para incluir desativados: `?includeInactive=true`.

---

## Troubleshooting

- **Porta 5432 ocupada:** o Compose usa **5433** de propósito.
- **Portas 3000/3001 ocupadas:** encerre o Vite ou a API que já estiver rodando.
- **Prisma / SSL (proxy corporativo):** `NODE_EXTRA_CA_CERTS`; não desative a validação TLS.
- **CORS:** confira `CORS_ORIGIN`.
- **CSS / classes Tailwind:** o `src/index.css` é compilado e congelado; preferir CSS dedicado.
- **Vimeo no console:** `ERR_BLOCKED_BY_CLIENT` costuma ser bloqueador de ads.
- **Galeria vazia:** rode `npm run setup` e `npm run server:dev`, ou use o modo Supabase.
- **Cards sem capa:** confira se `public/thumbs/` veio no clone; se faltar arquivo, `npm run thumbs:capture`.
