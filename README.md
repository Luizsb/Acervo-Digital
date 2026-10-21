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
| **Frontend** | React 18, TypeScript (modo estrito, `npm run typecheck`), Vite 6, CSS compilado (Tailwind congelado em `src/index.css`), Radix UI, Lucide React, Intro.js |
| **Backend** | Produção: Supabase (Auth + Data API com RLS). Local: Node.js, Express, TypeScript, Prisma 5, JWT e bcrypt |
| **Banco** | PostgreSQL. Produção no Supabase (`sa-east-1`); local via Docker Compose (porta **5433**) |
| **Dados** | ExcelJS, BNCC (`public/bncc.db`) |
| **Thumbs** | Playwright + Sharp (`npm run thumbs:capture`) |
| **Auth** | MVP: login único de visitante e de admin (botões na tela de login). JumpCloud na migração para a infraestrutura da Arco |
| **CI** | GitHub Actions: tipos, testes, `npm audit`, build, CodeQL, Trivy e Dependabot |

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
planilha do NDE (.xlsx, baixada do Drive)
    → planilha:preparar → diff:planilha → import:categorizacao   (máquina do operador)
    → PostgreSQL (Supabase em produção; Postgres local no desenvolvimento)
    → Data API do Supabase com RLS, ou API Express /api/odas no modo local
    → frontend (galeria para o leitor; fila de revisão para o admin)
```

O que fica no banco: título, códigos, BNCC, coleção, livro, bloco, SAMR, requisitos, **caminho da thumb** (`/thumbs/{marca}/{arquivo}.webp`) e **link externo** do ODA/vídeo. O mapa completo dos fluxos está no [SDD.md](./docs/SDD.md), em "Fluxos principais reais".

O que **não** fica no banco: o arquivo do ODA e o vídeo. As capas ficam em `public/thumbs/` e sobem no Git (WebP, cerca de 60 MB).

### Por que as thumbs não vão para o PostgreSQL

São mais de mil imagens. Guardá-las como `BYTEA` deixaria o banco pesado. O banco guarda só o caminho; o arquivo vai no disco e no repositório.

### Atualizar o catálogo quando a planilha oficial mudar

O caminho em uso é manual, na máquina de quem opera (com o `server/.env` apontando
para o Supabase):

```bash
npm run planilha:preparar -- "C:/Users/voce/Downloads/planilha-baixada.xlsx"
npm run diff:planilha          # o que vai mudar, sem tocar no banco
npm run db:exportar            # backup; enviar ao Drive restrito do time de ID
npm run import:categorizacao
npm run thumbs:capture         # capas que faltam; depois git add/commit/push
```

O `planilha:preparar` grava em `data/` só a aba `Recursos Digitais`, sem dados
pessoais. Apague o arquivo baixado depois. O passo a passo completo, com o que cada
etapa imprime, está no runbook do [SDD.md](./docs/SDD.md).

A chave é o **Código do recurso**. Em resumo: linha com código real é cadastrada,
mesmo quebrada ou sem link, e fica fora da galeria até ser corrigida. Linha sem
código e código repetido aparecem na fila do admin, para o NDE corrigir na
planilha. Código que sai da planilha é desativado, nunca apagado. A regra completa
está no SDD, em "Sincronização pelo código do recurso". Não use `--clear` no dia a
dia.

O gatilho do Google Apps Script (`scripts/apps-script/sync-acervo.gs`) está **parado**:
apontava para a API da EC2, que foi desligada. Volta quando houver servidor.

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

O front publica na Vercel a cada push em main, depois do CI (tipos, testes, auditoria
de dependências e build). O banco é o Supabase. Mudança de banco (migração do Prisma
e `scripts/supabase/rls.sql`) não é aplicada pelo deploy: veja "Aplicar mudanças de
banco" no SDD.
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
| `npm run typecheck` | Checagem de tipos do front (`tsconfig.json`, modo estrito); o CI roda |

---

## API (resumo)

| Área | Endpoints |
|------|-----------|
API Express, usada no modo local (`VITE_BACKEND=ec2`). Em produção o front fala com o
Supabase; as funções equivalentes estão em `scripts/supabase/rls.sql`.

| Área | Endpoints |
|------|-----------|
| **ODAs** | `GET/POST /api/odas`, `GET/PUT/DELETE /api/odas/:id`, `POST /api/odas/:id/view` |
| **Auth** | `POST /api/auth/login`, `register`, `forgot-password`, `reset-password`, `GET/PATCH /api/auth/me` |
| **Admin** (JWT com `role=admin`) | `GET /api/admin/review` (fila de revisão e problemas da planilha), `GET /api/admin/users` (usuários e perfis), `GET /api/admin/views/top`, `GET /api/admin/spreadsheet/status`, `POST /api/admin/spreadsheet`, `POST /api/admin/thumbs/capture` |
| **Favoritos** | `GET/POST /api/users/me/favorites`, `DELETE .../:projectId` |
| **BNCC** | `GET /api/bncc`, `GET /api/bncc/:codigo` |
| **Sincronização** | `POST /api/sync/spreadsheet`, `GET /api/sync/jobs/:jobId` (token `X-Acervo-Sync-Token`; usado pelo Apps Script, hoje parado) |

`GET /api/odas` retorna só o que entra na galeria: `ativo = true`, **Status do link = Funcionando** e **Link do recurso preenchido**. O resto fica no banco para a fila de revisão do admin. A regra está em `catalogVisibility.ts` (nos dois espelhos) e descrita no SDD.

---

## Troubleshooting

- **Porta 5432 ocupada:** o Compose usa **5433** de propósito.
- **Portas 3000/3001 ocupadas:** encerre o Vite ou a API que já estiver rodando.
- **Prisma / SSL (proxy corporativo):** `NODE_EXTRA_CA_CERTS`; não desative a validação TLS.
- **CORS:** confira `CORS_ORIGIN`.
- **CSS / classes Tailwind:** o `src/index.css` é compilado e congelado; preferir CSS dedicado.
- **Vimeo no console:** `ERR_BLOCKED_BY_CLIENT` costuma ser bloqueador de ads.
- **Galeria vazia:** rode `npm run setup` e `npm run server:dev`, ou use o modo Supabase.
- **Aviso "O banco do acervo está inativo":** o plano Free do Supabase pausou o projeto por falta de uso. Restaure no painel do Supabase e confira o workflow de ping (SDD, "Manter o Supabase acordado").
- **Página em branco depois de mover ou renomear arquivo:** reinicie o `npm run dev`; o Vite em execução guarda o caminho antigo.
- **Cards sem capa:** confira se `public/thumbs/` veio no clone; se faltar arquivo, `npm run thumbs:capture`.
