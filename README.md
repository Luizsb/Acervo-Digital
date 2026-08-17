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
│   ├── thumbs/                   # Capas webp versionadas (~60 MB)
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
upload manual de `.xlsx` e a data/origem da última sincronização concluída.

A planilha tem ~5 MB, então o Nginx do container web libera `client_max_body_size 30m`. Se aparecer `413 Request Entity Too Large`, o container web está com a config antiga: rode `docker compose up --build -d web`.

**Opção B — arquivo manual:** use **Enviar arquivo** no admin, substitua
`public/Categorização_Recursos Digitais_Terceiros.xlsx` e rode
`npm run import:categorizacao`, ou execute `docker compose up --build -d`.

O feedback (tela admin ou terminal) mostra novos, atualizados, desativados e recursos sem thumb.

Para comparar a planilha nova com a do Git sem tocar no banco: `npm run diff:planilha`.

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
| **Acervo** | `demo@acervo.local` / `demo1234` (botão Acessar o acervo) |
| **Admin (provisório)** | `admin@acervo.local` / `admin1234` (botão Acesso admin) |

Os dois entram no **mesmo acervo**. Só o admin vê **Fila de revisão** no menu do perfil (`#/revisao`): status em branco, quebrado, incorreto, restrito e demais pendências, inclusive linhas incompletas da planilha.

A primeira subida demora: a API aplica migrações e importa o catálogo. Se a porta 3000 ou 3001 já estiver em uso (`npm run dev` / `npm run server:dev`), encerre esses processos antes.

As capas já vêm em `public/thumbs/`. Só rode a captura se faltar imagem:

```bash
npm ci
cd server && npm ci && cd ..
npm run thumbs:setup
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

---

## Publicar na EC2

Na instância (Ubuntu 22.04 ou Amazon Linux 2023), Docker Compose sobe **Postgres + API + nginx**. O browser fala só com a porta 80; o nginx encaminha `/api` e `/health` para a API. Postgres e a porta 3001 ficam só em localhost.

**Na EC2, antes do deploy**, rode:

```bash
df -h
free -h
docker --version 2>/dev/null || echo "Docker ainda não instalado"
docker compose version 2>/dev/null || true
ls -la ~
du -sh ~/Acervo-Digital 2>/dev/null || echo "Repo ainda não clonado"
```

Peça pelo menos **~8 GB livres** (imagem + thumbs + Postgres). `t3.small` (2 GB RAM) no mínimo.

Na Amazon Linux 2023:

```bash
sudo dnf update -y
sudo dnf install -y git docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# faça logout/login para o grupo docker valer
```

No Ubuntu 22.04, instale com `apt-get` e o script oficial do Docker. Depois:

```bash
git clone https://github.com/Luizsb/Acervo-Digital.git
cd Acervo-Digital
cp .env.example .env
```

Em `.env`:

```env
POSTGRES_PASSWORD=senha-forte-do-banco
JWT_SECRET=chave-longa-aleatoria
WEB_BIND=0.0.0.0
WEB_PORT=80
CORS_ORIGIN=http://SEU_IP_OU_DOMINIO
VITE_API_URL=/api
```

Gere o JWT com `openssl rand -base64 48`. Suba:

```bash
docker compose up --build -d
```

A primeira subida importa a planilha para o Postgres (volume `acervo_pgdata`). A pasta
`public/thumbs` é compartilhada entre API e nginx; capturas feitas pelo painel admin persistem no
host e aparecem no site sem rebuild.

- App: `http://SEU_IP`
- Saúde da API (via nginx): `http://SEU_IP/health`

O volume do Postgres permanece entre atualizações. Se o catálogo já estiver no banco, pode usar `SKIP_SEED=true` nas próximas subidas para a API iniciar mais rápido.

---

## HTTPS na EC2 (Caddy)

Sem HTTPS os recursos não abrem no visualizador em tela ampliada. ODAs usam Service Worker e Cache API, que só existem em **contexto seguro**, e um iframe HTTPS dentro de uma página HTTP não conta como seguro — ele herda a insegurança da página que o contém. O resultado é o carregador do ODA parado em 0%. `localhost` é exceção na regra dos navegadores, por isso o mesmo recurso abre no ambiente local e falha no servidor. O mesmo vale para `navigator.clipboard`, usada no botão de copiar código.

O `caddy` no `docker-compose.yml` resolve isso emitindo e renovando o certificado sozinho, sem cron nem comando manual. Ele atende a internet nas portas 80 e 443 e repassa para o nginx, que passa a escutar só internamente. No `.env` da instância:

```env
COMPOSE_PROFILES=https
ACERVO_HOSTNAME=13-217-4-132.sslip.io
CORS_ORIGIN=https://13.217.4.132
WEB_BIND=127.0.0.1
WEB_PORT=3000
TRUST_PROXY=2
```

O endereço principal é o próprio IP, `https://13.217.4.132`, definido no `docker/Caddyfile`. A Let's Encrypt só emite certificado para endereço IP no perfil **`shortlived`**, com validade de 6 dias, e exige `disable_tlsalpn_challenge` para validar por HTTP-01 na porta 80. O Caddy renova bem antes de expirar; a contrapartida é que a janela de tolerância é curta, então **não bloqueie a porta 80**, senão a renovação falha e o site sai do ar.

O `ACERVO_HOSTNAME` é o endereço reserva, com certificado comum de 90 dias, que continua no ar se a renovação curta do IP falhar. Ele precisa resolver para o IP da instância: `sslip.io` faz isso sem cadastro. Para um subdomínio próprio, aponte o DNS para o IP e troque essa linha. Use **IP elástico**, senão nem o nome nem o certificado do IP continuam válidos depois de um reinício.

`TRUST_PROXY` é a quantidade de proxies na frente da API: `1` com apenas o nginx, `2` com o Caddy também. Se ficar menor que o real, o limitador de login enxerga o IP do proxy no lugar do usuário e um bloqueio atinge todos ao mesmo tempo.

O grupo de segurança precisa liberar a **porta 443**. A porta 80 continua aberta porque o Caddy a usa para provar o domínio ao pedir o certificado, e porque o IP em HTTP segue atendendo a rotina do Apps Script e serve de rede de segurança se a emissão falhar.

Os certificados ficam no volume `acervo_caddy_data`. Não remova esse volume sem necessidade: cada emissão nova consome cota da Let's Encrypt.

---

## Deploy automático (GitHub Actions)

Todo push em `main` roda o workflow `.github/workflows/ci-e-deploy.yml`: primeiro testes, build do frontend e checagem de tipos da API; se tudo passar, ele entra na EC2 por SSH e executa `scripts/deploy-ec2.sh`. Em pull requests só a etapa de verificação roda. Para repetir um deploy sem novo commit, use **Run workflow** na aba Actions.

O script na instância faz `git reset --hard origin/main`, sobe os containers com `--build`, espera `/health` responder e remove imagens órfãs (o disco é pequeno). Se a API não responder, o deploy falha com os logs no console do Actions e os containers anteriores continuam no ar.

**Segredos** em *Settings > Secrets and variables > Actions*:

| Segredo | Valor |
|---------|-------|
| `EC2_HOST` | IP público da instância |
| `EC2_USER` | `ec2-user` na Amazon Linux, `ubuntu` no Ubuntu |
| `EC2_SSH_KEY` | chave privada dedicada ao deploy, conteúdo completo do arquivo |

Gere uma chave só para o CI, para poder revogá-la sem afetar seu acesso pessoal:

```bash
ssh-keygen -t ed25519 -f acervo-deploy-key -N "" -C "github-actions-acervo-digital"
```

Envie a pública para a instância (`~/.ssh/authorized_keys`) e cole a privada no segredo. O grupo de segurança precisa aceitar a porta 22 da internet, porque os runners do GitHub têm IP dinâmico. Mantenha `PasswordAuthentication no` (padrão na Amazon Linux 2023): só chave é aceita, então as varreduras automáticas de bots não passam. Para eliminar essa exposição no futuro, o caminho é trocar o SSH por **AWS SSM Send-Command** com OIDC, sem porta aberta nem chave guardada no GitHub.

Atualizar à mão continua possível:

```bash
cd ~/Acervo-Digital && bash scripts/deploy-ec2.sh
```

Atualização de **conteúdo** não precisa de deploy: o gatilho diário do Apps Script envia a planilha para o webhook da API e o catálogo muda sozinho.

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
| `npm run seed` | BNCC + usuários demo/admin + planilha |
| `npm run import:categorizacao` | Sincroniza a planilha com o banco |
| `npm run diff:planilha` | Compara a planilha local com a versão no Git |
| `npm run thumbs:setup` | Instala o Chromium para captura local |
| `npm run thumbs:capture` | Captura thumbs faltantes |
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
- **Portas 3000/3001 ocupadas:** encerre Vite/API locais antes de `docker compose up`.
- **Prisma / SSL (proxy corporativo):** `NODE_EXTRA_CA_CERTS`; não desative a validação TLS.
- **CORS:** confira `CORS_ORIGIN`.
- **CSS / classes Tailwind:** o `src/index.css` é compilado e congelado; preferir CSS dedicado.
- **Vimeo no console:** `ERR_BLOCKED_BY_CLIENT` costuma ser bloqueador de ads.
- **Galeria vazia:** no Docker, aguarde o seed da API; no modo local, rode `npm run setup`.
- **Cards sem capa:** confira se `public/thumbs/` veio no clone; se faltar arquivo, `npm run thumbs:capture`.
- **EC2 abre o site mas a API falha:** o frontend deve usar `VITE_API_URL=/api` (rebuild da imagem web). Não use `localhost:3001` no browser remoto.
