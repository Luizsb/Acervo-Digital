# 🧭 Norte do projeto — Acervo Digital

Documento técnico de referência. Descreve o projeto **como ele é hoje**, não como
gostaríamos que fosse. O que estiver incerto está marcado.

---

## Visão geral

Aplicação web de página única que serve um catálogo de recursos digitais
educacionais a partir de um banco PostgreSQL. O dado editorial nasce numa planilha
de categorização, é importado para o banco por um comando e nunca é lido em tempo
real pelo front.

O projeto tem uma característica incomum que precisa ser entendida antes de qualquer
alteração: **existem dois backends completos e selecionáveis por variável de
ambiente**.

| Modo | O que é | Onde roda hoje |
|------|---------|----------------|
| `VITE_BACKEND=supabase` | Supabase Auth + Data API (PostgREST) falando direto com o Postgres, protegido por RLS | **Produção, na Vercel** |
| `VITE_BACKEND=ec2` | API Express + Prisma em `server/`, com JWT próprio | Desenvolvimento local e plano de retorno para a AWS |

Isso não é acidente nem sobra de migração: é a decisão de manter o caminho de volta
para a EC2 vivo enquanto o acesso à instância não é recuperado. `src/utils/api.ts` é
o ponto único de desvio entre os dois.

## Escopo atual

- Autenticação e sessão.
- Galeria autenticada com busca textual, filtros combináveis, paginação e dois modos
  de exibição.
- Ficha do recurso com metadados pedagógicos, BNCC e relacionados.
- Visualizador do recurso em modal de tela ampliada.
- Favoritos por usuário.
- Telemetria de visualização (ficha aberta e recurso aberto).
- Painel administrativo: fila de revisão, status de sincronização, histórico de
  importação, ranking de acessos, captura de capas.
- Importação idempotente da planilha de categorização.
- Captura automatizada de capas.

## Fora de escopo

- **Edição do dado editorial na aplicação.** Não há CRUD de recurso para o usuário.
  A planilha é a origem; a aplicação é consumidora. O `POST /api/odas` existe na API
  Express, mas não é usado pela interface.
- **Hospedagem dos arquivos de recurso.** O ODA e o vídeo ficam em servidores de
  terceiros. O banco guarda apenas o link externo.
- **Cadastro público de usuários.** Controlado por `ENABLE_REGISTRATION`, hoje
  `false`, esperando o SSO.
- **Relatórios e dashboards de uso.** Os dados de visualização existem no banco, mas
  não há tela analítica além do ranking simples no admin.

---

## Fluxos principais reais

### Fluxo do dado editorial

```
Planilha de categorização (.xlsx)
        │
        │  npm run import:categorizacao   (rodado na máquina do mantenedor)
        ▼
PostgreSQL no Supabase  ──►  tabela odas + registro em import_events
        │
        │  Data API (PostgREST) com RLS
        ▼
Front na Vercel  ──►  galeria e ficha do recurso
```

### Fluxo das capas

```
Recurso com link válido
        │
        │  npm run thumbs:capture   (Playwright abre a página e fotografa)
        ▼
public/thumbs/{codigo}.webp   (Sharp converte e comprime)
        │
        │  git commit + git push
        ▼
Build da Vercel publica os arquivos estáticos
```

As capas **não** ficam no banco. O banco guarda o caminho `/thumbs/{codigo}.webp`.
São mais de mil arquivos, cerca de 60 MB, versionados no Git. Isso significa que
**publicar capa nova exige commit**, não é operação de banco.

### Fluxo de autenticação

No modo Supabase, o login usa `signInWithPassword` e o papel de administrador é lido
de `app_metadata.role` no JWT emitido pelo Supabase. A função SQL
`is_acervo_admin()` traduz isso para as políticas de RLS.

No modo Express, o login valida a senha com bcrypt e emite um JWT próprio com
`role` no payload. A rota `/api/admin/*` exige `role = admin`.

### Fluxo de visualização

O front chama a RPC `record_oda_view()` (Supabase) ou `POST /api/odas/:id/views`
(Express). Há deduplicação: um mesmo usuário conta uma vez por recurso por dia, no
fuso de São Paulo. Dois tipos são distinguidos: `page` (abriu a ficha) e `open`
(abriu o recurso de fato).

---

## Arquitetura e stack identificadas

| Camada | Tecnologia |
|--------|-----------|
| Front | React 18, TypeScript, Vite 6, Radix UI, Lucide, Intro.js |
| Estilo | Tailwind **compilado e congelado** em `src/index.css` + CSS por componente |
| API (modo ec2) | Node.js, Express, TypeScript, Prisma 5, JWT, bcrypt |
| API (modo supabase) | Supabase Data API (PostgREST) + Auth, protegidos por RLS |
| Banco | PostgreSQL 16. Produção: Supabase, região `sa-east-1`, plano Free. Local: Docker na porta **5433** |
| Capas | Playwright (Chromium) + Sharp |
| Planilha | ExcelJS |
| Testes | Vitest, apenas testes unitários de utilitários |
| Hospedagem | Vercel (front). Docker Compose com nginx e Caddy permanece para a EC2 |
| Automação | GitHub Actions: CI de verificação e ping semanal no Supabase |

### Organização das pastas

```
src/
  components/     páginas e componentes de interface
  config/         backend.ts decide entre Express e Supabase
  contexts/       AuthContext
  hooks/          filtros da galeria, tamanho de página
  utils/          api.ts (desvio), supabaseApi.ts, catalogVisibility.ts, galleryLayout.ts
  guidelines/     diretrizes de interface
server/
  routes/         odas, auth, admin, favorites, bncc, sync
  lib/            spreadsheetSync, catalogVisibility, excel, odaViews, prisma
  prisma/         schema.prisma e 8 migrações
  scripts/        import-categorizacao, capture-thumbs, seed, diff-planilha
public/
  thumbs/         capas .webp versionadas (~60 MB)
  Categorização_Recursos Digitais_Terceiros.xlsx
  bncc.db
scripts/
  supabase/rls.sql          políticas e funções do Supabase
  apps-script/sync-acervo.gs gatilho diário (parado)
  deploy-ec2.sh, recover-ec2-http.sh
docker/                     nginx.conf e Caddyfile
```

---

## Dados, entradas e saídas

**Entrada única de conteúdo:** a planilha `public/Categorização_Recursos
Digitais_Terceiros.xlsx`. A coluna **Código do recurso** é a chave de
sincronização.

**Tabelas principais:** `odas` (catálogo), `bncc` (habilidades),
`import_events` (histórico de importação), `keep_alive` (uma linha, só para o ping).

**Tabelas de usuário, duplicadas por backend:**

| Modo Express | Modo Supabase |
|---|---|
| `users` | `auth.users` (gerenciado pelo Supabase) |
| `user_favorites` | `auth_favorites` |
| `oda_view_events` | `auth_view_events` |

Essa duplicação é consequência de o Supabase gerenciar a identidade. **Favoritos
criados num modo não aparecem no outro.**

**Objetos SQL no Supabase** (definidos em `scripts/supabase/rls.sql`):
`is_acervo_admin()` e `record_oda_view()`, ambas `SECURITY DEFINER` com `EXECUTE`
concedido apenas ao papel `authenticated`. RLS está habilitada em todas as tabelas
públicas, inclusive `_prisma_migrations`, que tem todo acesso revogado.

**Volume:** ordem de mil e duzentos recursos e mil e trezentas habilidades BNCC.
`[A VALIDAR]` os números exatos devem ser lidos no painel admin.

---

## Regras de negócio percebidas

### Visibilidade na galeria

A regra mais importante do sistema. Está centralizada em
`server/lib/catalogVisibility.ts` e no equivalente em `src/utils/`. Um recurso
aparece na galeria somente se:

1. `ativo = true`, **e**
2. o status do link é `Funcionando` (comparação sem acento e sem diferenciar
   maiúsculas), **e**
3. o link do recurso está preenchido.

Todo o resto continua no banco e vai para a **fila de revisão** do admin, agrupado
em: sem link, quebrado, incorreto, acesso restrito, dúvida para revisão, não
avaliado, em cadastro, outro. O caso "sem link" é o recurso marcado como
`Funcionando` mas sem endereço — a planilha diz que está pronto e não está.

### Sincronização pelo código do recurso

| Situação na planilha | Efeito no banco |
|---|---|
| Código novo | Cria o recurso |
| Código existente com campo alterado | Atualiza |
| Código existente sem alteração | Só marca a data de sincronização |
| Código que saiu da planilha | **Desativa** (`ativo = false`) e sai da galeria |
| Código que voltou | Reativa |

Nada é apagado. O `--clear` existe no script e **não deve ser usado na rotina**.

Linha sem código recebe o identificador provisório `PLANILHA_L{número da linha}`.
Esses registros nunca entram na galeria e nunca geram captura de capa: aparecem na
fila de revisão como cadastro incompleto.

### Classificação do recurso

Macroformato `Vídeo`, `Playlist` ou `Áudio` vira **Audiovisual** na interface. Os
demais macroformatos viram **OED**. Código terminando em `_VA` seguido de número
identifica vídeo-aula, que ganha o selo de duração no card.

### Contagem de visualizações

Uma contagem por usuário, por recurso, por dia, no fuso de São Paulo. A ordenação
padrão da galeria usa `pageViewCount` decrescente, depois `openViewCount`
decrescente, depois `id` decrescente — implementado em
`src/utils/galleryLayout.ts` e na consulta de `server/routes/odas.ts`.

### Captura de capas

Só captura recurso que está no catálogo público: status `Funcionando`, link
preenchido e código real. Esse critério é o mesmo do painel admin, deliberadamente:
a linha de comando e o painel não podem discordar sobre o que é elegível.

---

## Rotina de operação (runbook)

**Esta é a seção que mantém o acervo funcionando.** Quem assume o projeto deve
executar o item "Preparar a máquina" antes de precisar dele.

### Preparar a máquina (uma vez)

Requisitos: Node.js 20 ou superior, Git e Docker Desktop (o Docker só é necessário
para desenvolver contra o banco local).

```bash
git clone https://github.com/Luizsb/Acervo-Digital.git
cd Acervo-Digital
npm ci
cd server && npm ci && cd ..
npm run thumbs:setup      # instala o Chromium usado na captura de capas
```

Crie `server/.env` a partir de `server/.env.example` apontando para o Supabase:

```env
DATABASE_URL="postgresql://postgres.iezvzcrmzdfljvbbdneu:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.iezvzcrmzdfljvbbdneu:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

A senha do banco está no painel do Supabase, em *Settings → Database*. **Não existe
no repositório e não deve existir.** Na transferência de responsabilidade ela é
repassada por mensagem direta, junto com os acessos aos painéis do Supabase, da
Vercel e do GitHub.

### Atualizar o catálogo quando a planilha oficial mudar

Este é o procedimento mais frequente. Leva alguns minutos e o terminal fica sem
mensagem durante boa parte do tempo — é normal, o script processa mais de mil linhas
antes de imprimir o resumo.

```bash
# 1. Substitua o arquivo public/Categorização_Recursos Digitais_Terceiros.xlsx
#    pela versão nova, mantendo exatamente o mesmo nome.

# 2. Confira o que vai mudar, sem tocar no banco:
npm run diff:planilha

# 3. Aplique no banco:
npm run import:categorizacao

# 4. Gere as capas dos recursos novos:
npm run thumbs:capture

# 5. Publique. As capas só aparecem no site depois do push:
git add public/thumbs "public/Categorização_Recursos Digitais_Terceiros.xlsx"
git commit -m "chore(acervo): atualiza planilha e capas"
git push
```

O passo 3 imprime quantos recursos foram criados, atualizados, desativados e quantos
estão sem capa. Os mesmos números ficam registrados em `import_events` e aparecem no
painel admin, na aba de histórico, com data, hora e a capa de cada item.

O passo 5 dispara o build da Vercel automaticamente. O banco já está atualizado
desde o passo 3, então o catálogo muda antes das capas.

### Recapturar capas que saíram erradas

Quando a captura pegou uma tela de carregamento em vez do recurso:

```bash
cd server
npx tsx scripts/capture-thumbs.ts --validate-existing
```

### Conferir se o site está no ar

```bash
curl -sS "https://iezvzcrmzdfljvbbdneu.supabase.co/rest/v1/keep_alive?select=id&limit=1" \
  -H "apikey: CHAVE_ANON" -H "Authorization: Bearer CHAVE_ANON"
```

Resposta esperada: `[{"id":1}]`. Se der erro de nome não resolvido, veja
"Problemas conhecidos" abaixo.

### Manter o Supabase acordado

O plano Free pausa o projeto após 7 dias sem consulta. O workflow
`.github/workflows/keep-supabase-awake.yml` consulta a tabela `keep_alive` toda
terça e sexta às 8h de Brasília. **Se o projeto ficar sem push e sem acesso, esse
workflow é a única coisa que impede a pausa** — o GitHub desativa workflows
agendados em repositórios sem atividade por 60 dias, então vale conferir a aba
Actions ao voltar de um período longo sem mexer no projeto.

Se o projeto pausar, é preciso restaurá-lo manualmente no painel do Supabase. Não há
como fazer isso por API no plano Free.

### Desenvolver localmente

Contra o banco local em Docker, com a API Express:

```bash
npm run setup        # sobe o Postgres, migra e importa a planilha
npm run server:dev   # API na porta 3001
npm run dev          # em outro terminal: front na porta 3000
```

Usuários de teste: `demo@acervo.local` / `demo1234` e `admin@acervo.local` /
`admin1234`. Só o admin vê a fila de revisão.

Para desenvolver contra o Supabase, crie um `.env` na raiz com `VITE_BACKEND=supabase`,
`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, e rode só `npm run dev`. Nesse modo o
Express não é usado e a importação e a captura de capas ficam bloqueadas na interface.

### Alterar a configuração de produção

Na Vercel, em *Settings → Environment Variables*, as três variáveis que importam
são `VITE_BACKEND=supabase`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
Mudança de variável exige **novo deploy** para valer: o Vite injeta os valores no
momento do build.

Alterações em `scripts/supabase/rls.sql` não são aplicadas automaticamente. É preciso
colar o conteúdo no *SQL Editor* do Supabase e executar.

### Voltar para a EC2

O caminho está preservado. Quando o acesso à instância for recuperado: `VITE_BACKEND=ec2`,
`docker compose up --build -d` na instância e o job de deploy reativado no CI com a
variável `ENABLE_EC2_DEPLOY=true`. Para emergência há
`scripts/recover-ec2-http.sh`, que sobe só HTTP e sem reimportar a planilha. O
detalhamento de HTTPS, Caddy e certificados está no `README.md`.

### Problemas conhecidos e o que fazer

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `ERR_NAME_NOT_RESOLVED` no domínio do Supabase | DNS da rede corporativa bloqueando, **ou** projeto pausado | Testar em outra rede antes de concluir que pausou. Já aconteceu de ser só o DNS corporativo |
| Erro de JSON ao fazer login no ambiente local | A API Express não está rodando | `npm run server:dev` em outro terminal |
| Galeria vazia | Banco sem catálogo | `npm run import:categorizacao` |
| Cards sem capa | Capas não vieram no clone ou faltou captura | Conferir `public/thumbs/`, rodar `npm run thumbs:capture` e **commitar** |
| Capa nova não aparece no site | Falta o push | As capas são arquivos versionados; sem commit não sobem |
| Porta 3000 ou 3001 ocupada | Vite ou API já rodando | Encerrar os processos antes de subir o Docker |

---

## Critérios de qualidade

- `npm run test` (Vitest) passa. A cobertura é de utilitários: filtros, ordenação,
  visibilidade do catálogo e normalizações.
- `npm run build` conclui sem erro de tipo.
- `cd server && npx tsc --noEmit` conclui sem erro.
- Regra de visibilidade do catálogo alterada apenas nos arquivos
  `catalogVisibility.ts`, nunca replicada em condicional solta.
- Mudança de API implementada nos **dois** backends, ou com recusa explícita e
  documentada no modo não suportado.
- Nenhum segredo no repositório. Chave `anon` do Supabase é pública por design;
  `service_role`, senha do banco, `JWT_SECRET` e `SPREADSHEET_SYNC_TOKEN` não são.
- Importação idempotente: rodar duas vezes a mesma planilha não deve gerar
  diferença na segunda execução.

---

## Riscos e pontos de atenção

**A operação depende de uma máquina, não de um servidor.** Importar planilha e
capturar capas exige Node, Playwright e a senha do banco num computador. Se ninguém
tiver esse ambiente, o catálogo congela. É o maior risco do projeto hoje.

**O plano Free do Supabase pausa por inatividade.** Existe mitigação, mas ela mora
num workflow do GitHub que o próprio GitHub desativa se o repositório ficar parado.

**Há dois projetos Supabase na conta, e apenas um vale.** A produção é
`iezvzcrmzdfljvbbdneu`. O outro, `adungjmhuibxvgiqrume` ("Acervo Digital - Arco"),
está sem uso e **foi decidido excluí-lo** — enquanto isso não acontecer, confira
sempre o identificador do projeto antes de mexer em qualquer configuração.

**A senha do banco Supabase circulou em conversa de chat** durante a migração. Ficou
decidido **não rotacioná-la**: a conversa foi interna e o risco foi avaliado e aceito
pelo responsável. A senha continua sendo tratada como segredo e não entra no
repositório.

**A instância EC2 está inacessível.** SSH na porta 22 não responde e não há acesso ao
console AWS para investigar. Enquanto isso, o gatilho diário do Apps Script está
parado, porque aponta para a API daquela instância.

**O visualizador em tela ampliada pode abrir em branco.** ODAs de terceiros podem
recusar `iframe` por `X-Frame-Options` ou `CSP: frame-ancestors`. Não há hoje
fallback de abertura externa nem medição de quantos links são afetados.

**Autenticação sem SSO.** Usuários com senha definida manualmente e o botão
JumpCloud sem função. A proteção contra senha vazada do Supabase Auth está
desligada — decisão consciente enquanto não há base real de usuários.

**Este repositório é público no GitHub.** Toda documentação aqui é legível por
qualquer pessoa.

---

## Débitos estruturais

- **Dois backends dobram o custo de cada mudança de API.** É uma escolha
  deliberada, com prazo indefinido. Enquanto durar, `src/utils/api.ts` precisa ser
  tratado como fronteira arquitetural, não como arquivo utilitário.
- **Duas identidades de usuário sem ponte.** Favoritos e histórico de visualização
  não migram entre os modos.
- **Documentação de infraestrutura dividida.** O `README.md` tem o detalhe de EC2,
  Docker, nginx, Caddy e certificados; este `SDD.md` tem a operação atual. Há risco
  de as duas divergirem.
- **Sem teste de integração nem end-to-end.** Nenhuma cobertura do fluxo de login,
  da galeria ou da importação.
- **Bundle inicial acima do recomendado** pelo Vite, na casa dos 500 kB. Há lazy
  loading das páginas pesadas, mas o pacote principal ainda é grande.
- **`src/guidelines/Guidelines.md` pode estar parcialmente obsoleto.**
  `[HIPÓTESE — CONFIRMAR]` o documento descreve classes utilitárias do Tailwind, mas
  o `src/index.css` está compilado e congelado, então parte das diretrizes pode não
  ser mais aplicável na prática.
- **O workflow de ping tem a URL e a chave `anon` embutidas como valor padrão** e
  também dispara em push. Foi feito assim para validar sem depender de secret.
  Funciona, mas o correto é cadastrar `SUPABASE_URL` e `SUPABASE_ANON_KEY` como
  secrets e remover o gatilho de push.
- **Projeto na Vercel com nome herdado** do repositório, resultando numa URL com
  sufixo aleatório em vez de um endereço escolhido.

---

## Pontos a complementar

- `[PERGUNTA AO RESPONSÁVEL]` A estratégia é consolidar em Vercel + Supabase ou
  voltar para a EC2? A decisão registrada em setembro de 2026 foi manter os dois
  documentados, com a EC2 como plano de retorno, mas sem prazo definido. Enquanto
  não houver decisão, o débito dos dois backends continua crescendo.
- `[A VALIDAR]` Quantos recursos do catálogo aceitam `iframe`, para dimensionar o
  risco do visualizador em tela ampliada.
- `[A VALIDAR]` Se há backup do banco além do que o plano Free do Supabase oferece.
  Não encontrei rotina de dump no repositório.
