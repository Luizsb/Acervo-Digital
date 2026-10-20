# 🧭 Norte do projeto — Acervo Digital

Documento técnico de referência. Descreve o projeto **como ele é hoje**, não como
gostaríamos que fosse. O que estiver incerto está marcado.

---

## Visão geral

Aplicação web de página única que serve um catálogo de recursos digitais
educacionais a partir de um banco PostgreSQL. O dado editorial nasce na planilha de
categorização mantida pelo **NDE no Drive da empresa**, é baixado manualmente,
preparado e importado para o banco por comandos, e nunca é lido em tempo real pelo
front. O banco é o **local oficial dos dados do Acervo**.

O projeto tem uma característica incomum que precisa ser entendida antes de qualquer
alteração: **existem dois backends completos e selecionáveis por variável de
ambiente**.

| Modo | O que é | Onde roda hoje |
|------|---------|----------------|
| `VITE_BACKEND=supabase` | Supabase Auth + Data API (PostgREST) falando direto com o Postgres, protegido por RLS | **Ambiente de testes**, na Vercel com Supabase Free |
| `VITE_BACKEND=ec2` | API Express + Prisma em `server/`, com JWT próprio | Desenvolvimento local e **caminho para o ambiente corporativo** |

Isso não é acidente nem sobra de migração. Desde outubro de 2026, a Vercel com o
Supabase é tratada como ambiente de testes do MVP. O destino é um servidor
corporativo da Arco, com o SSO JumpCloud, e o backend que roda num servidor é o
Express. `src/utils/api.ts` é o ponto único de desvio entre os dois.

## Escopo atual

- Autenticação e sessão.
- Galeria autenticada com busca textual, filtros combináveis, paginação e dois modos
  de exibição.
- Ficha do recurso com metadados pedagógicos, BNCC e relacionados.
- Abertura do recurso: vídeo em modal de tela ampliada; ODA e demais em nova guia.
- Favoritos por usuário.
- Telemetria de visualização (ficha aberta e recurso aberto).
- Painel administrativo: fila de revisão, status de sincronização, histórico de
  importação, ranking de acessos, captura de capas.
- Importação idempotente da planilha de categorização.
- Captura automatizada de capas.

## Fora de escopo

- **Edição do dado editorial na aplicação.** Não há CRUD de recurso para o usuário.
  A categorização é trabalho do NDE na planilha do Drive; a aplicação é consumidora.
- **Leitura automática da planilha do Drive.** A TI bloqueia o acesso automatizado;
  o download é manual. Automatizar é desejo, não compromisso.
- **Tela de gestão de perfis.** Promover ou rebaixar administrador é feito direto no
  banco, por decisão do responsável, para não criar fluxo de dados pessoais na
  interface. O `POST /api/odas` existe na API
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
Planilha de categorização do NDE (Drive da empresa, todas as abas)
        │
        │  download manual
        │  npm run planilha:preparar   (só a aba Recursos Digitais, só valores,
        │                               sem a coluna Avaliador) → data/
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
public/thumbs/{marca}/{arquivo}.webp   (Sharp converte e comprime)
        │
        │  git commit + git push
        ▼
Build da Vercel publica os arquivos estáticos
```

As capas **não** ficam no banco. O banco guarda o caminho, por exemplo
`/thumbs/sae/EF21_8_MAT_L1_U1_01_OD1.webp`. São cerca de 2.500 arquivos versionados
no Git. Isso significa que **publicar capa nova exige commit**, não é operação de
banco.

A regra do caminho está centralizada em `server/lib/thumbPaths.ts`, com espelho em
`src/utils/thumbPaths.ts`. Os dois são mantidos iguais, e um teste compara os dois:

- **Pasta:** é a coluna Marca, em minúsculas, sem acento e sem espaço (`sae`,
  `conquista`). Marca nova ganha pasta sozinha. Código `IMP/...` com a marca em branco
  vai para `conquista`; outros códigos sem marca vão para `sem-marca`. As pastas são
  em minúsculas porque o Windows não diferencia caixa e a Vercel diferencia.
- **Arquivo:** é o código com tudo que não seja letra, número, `.`, `_` ou `-` trocado
  por `_`, sem `_` nem `.` nas pontas. `IMP/63/ALA19/` vira `IMP_63_ALA19.webp`. A
  barra do código não pode virar subpasta nem deixar o arquivo sem nome.

Se a marca de um recurso mudar na planilha, o caminho da capa muda junto: a captura
gera a capa na pasta nova e a antiga fica órfã.

### Fluxo de autenticação

No modo Supabase, o login usa `signInWithPassword` e o papel de administrador é lido
**apenas** de `app_metadata.role` no JWT emitido pelo Supabase. A função SQL
`is_acervo_admin()` traduz isso para as políticas de RLS. `user_metadata` nunca
concede papel: o próprio usuário consegue editá-lo. Promover ou rebaixar admin é
feito pelo banco; o procedimento está no runbook, em "Promover ou rebaixar
administrador". O papel é restrito a e-mails `@arcoeducacao.com.br` dos times de
Interações Digitais e Acervo.

Enquanto o JumpCloud não chega, a tela de login tem dois botões de acesso rápido com
credenciais fixas no front (`src/components/LoginPage.tsx`): um de leitura e um de
admin provisório. Quem tem a URL do ambiente de testes entra como admin.

No modo Express, o login valida a senha com bcrypt e emite um JWT próprio com
`role` no payload. A rota `/api/admin/*` exige `role = admin`.

### Falhas de carregamento e endereço inexistente

- **Token "emitido no futuro":** logo após renovar a sessão, a Data API do Supabase
  pode recusar o token com 401 "JWT issued at future", por diferença de relógio entre
  o Auth e a API `[HIPÓTESE — CONFIRMAR]`. O cliente do Supabase
  (`src/lib/supabaseClient.ts`) usa `createJwtRetryFetch`
  (`src/utils/jwtRetryFetch.ts`): repete a chamada depois de 1 s e de 2 s, e só
  nesse erro.
- **Aviso de falha do catálogo:** `CatalogLoadError` classifica a falha
  (`src/utils/catalogLoadError.ts`) e oferece "Tentar novamente". As instruções de
  desenvolvimento (`server:dev`, `prisma:migrate`) só aparecem no modo Express.
- **Página 404:**
  - Rota interna desconhecida (`#/xyz`) e link de recurso que o catálogo não tem
    (`#/recurso/<codigo>`) abrem `NotFoundPage`. O link de recurso mostra o código
    pedido.
  - Endereço inexistente fora do hash (`/xyz`) recebe `public/404.html`, página
    estática servida pela Vercel. `#/home`, da versão anterior, continua levando ao
    login.

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
| Segurança no CI | `npm audit`, CodeQL, Trivy e Dependabot (ver "Segurança e privacidade") |
| Mapa do código | Graphify, ferramenta local de desenvolvimento, fora das dependências (ver `README.md`) |
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
  lib/            map-categorizacao, spreadsheetSync, catalogVisibility, thumbPaths, excel,
                  odaViews, prisma
  prisma/         schema.prisma e 8 migrações
  scripts/        import-categorizacao, capture-thumbs, diff-planilha, preparar-planilha,
                  exportar-banco, seed, setup-playwright
public/
  thumbs/         capas .webp versionadas, uma pasta por marca (sae/, conquista/...)
  bncc.db
data/             planilha de categorização, fora do Git (ver "Dados, entradas e saídas")
scripts/
  supabase/rls.sql          políticas e funções do Supabase
  apps-script/sync-acervo.gs gatilho diário (parado)
  deploy-ec2.sh, recover-ec2-http.sh
docker/                     nginx.conf e Caddyfile
```

---

## Dados, entradas e saídas

**Entrada única de conteúdo:** a planilha `data/Categorização_Recursos
Digitais_Terceiros.xlsx`, cópia preparada da planilha oficial do NDE no Drive. A
coluna **Código do recurso** é a chave de sincronização.

**Minimização de dados.** A planilha do Drive tem quase trinta abas, algumas com
e-mails de quem a operou (logs do Apps Script), e a coluna "Avaliador", com nomes de
pessoas. Nada disso é usado pelo Acervo. O `npm run planilha:preparar` grava em
`data/` só a aba `Recursos Digitais`, só valores (sem fórmulas, comentários nem
metadados do arquivo original) e sem as colunas listadas em
`PERSONAL_DATA_COLUMNS` (`server/lib/planilhaLayout.ts`). A estrutura da aba (nome,
linha de cabeçalho, primeira linha de dados) também é definida nesse arquivo.

A planilha **não fica em `public/` nem no Git**: tudo em `public/` vira arquivo
estático acessível sem login, e a planilha traz recursos não publicáveis. Os caminhos são definidos em `server/lib/acervoPaths.ts`; a variável
`ACERVO_DATA_DIR` troca o diretório. Ao fim de cada importação sem erros, uma cópia
vai para `data/ultima-importada.xlsx`, que é a base do `diff:planilha`.

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

**Desde 2026-10-20, só esse recurso é cadastrado.** A importação usa o mesmo critério
(`isImportableResource`, em `server/lib/catalogVisibility.ts`), acrescido de código
real: quebrado, incorreto, não avaliado, acesso restrito, sem link e linha sem código
ficam na planilha, sob a curadoria do NDE. O que já estava no banco e deixa de passar
é desativado, como um código que saiu da planilha.

A **fila de revisão** do admin continua existindo e mostra o que estiver ativo fora
da regra, agrupado em: sem link, quebrado, incorreto, acesso restrito, dúvida para
revisão, não avaliado, em cadastro, outro. Com o critério de importação, ela tende a
ficar vazia.

### Sincronização pelo código do recurso

| Situação na planilha | Efeito no banco |
|---|---|
| Linha fora do critério (não `Funcionando`, sem link ou sem código) | Não cadastra; se já existia, **desativa** |
| Código novo | Cria o recurso |
| Código existente com campo alterado | Atualiza |
| Código existente sem alteração | Só marca a data de sincronização |
| Código que saiu da planilha | **Desativa** (`ativo = false`) e sai da galeria |
| Código que voltou, ou que voltou a `Funcionando` | Reativa |

Nada é apagado. O `--clear` existe no script e **não deve ser usado na rotina**.

Linha sem código recebe o identificador provisório `PLANILHA_L{número da linha}` e não
é cadastrada.

**Códigos repetidos.** O resumo da importação lista cada código que aparece em mais de
uma linha, com os números das linhas (`findRepeatedCodes`). Entre as linhas do critério,
a última vence; uma linha repetida fora do critério é ignorada, então o recurso
`Funcionando` não é mais escondido por uma cópia `Não avaliado` mais abaixo. Códigos
que só diferem pela barra final (`IMP/24/GLA10` e `IMP/24/GLA10/`) contam como
recursos diferentes: a correção é editorial.

### Classificação do recurso

Macroformato `Vídeo`, `Playlist` ou `Áudio` vira **Audiovisual** na interface. Os
demais macroformatos viram **OED**. Código terminando em `_VA` seguido de número
identifica vídeo-aula, que ganha o selo de duração no card.

### Marca do recurso

A marca vem da coluna Marca da planilha. Quando ela está em branco, a marca é deduzida
pelo prefixo do código: `IMP/...` é **Conquista**. A regra está em `brandFromCode`
(`thumbPaths.ts`, nos dois espelhos) e serve à pasta da capa e ao recurso exibido na
interface, aplicada em `apiODAToFrontend` (`src/utils/api.ts`), por onde passam os
dois backends. Assim, filtro, selo do card e busca concordam com a pasta da capa. O
banco continua guardando a marca como veio da planilha.

Na galeria, o filtro de Marca é o primeiro do grupo Localização.

### Contagem de visualizações

Uma contagem por usuário, por recurso, por dia, no fuso de São Paulo. A ordenação
padrão da galeria usa `pageViewCount` decrescente, depois `openViewCount`
decrescente, depois `id` decrescente — implementado em
`src/utils/galleryLayout.ts` e na consulta de `server/routes/odas.ts`.

### Captura de capas

Só captura recurso que está no catálogo público: status `Funcionando`, link
preenchido e código real. Esse critério é o mesmo do painel admin, deliberadamente:
a linha de comando e o painel não podem discordar sobre o que é elegível.

O caminho da capa segue a regra de `thumbPaths.ts` (ver "Fluxo das capas"). Captura,
importação, `diff:planilha` e a auditoria de capas do admin usam a mesma função; nenhum
desses pontos monta o caminho por conta própria.

---

## Segurança e privacidade

Esta seção responde aos apontamentos do relatório do Comitê Security by Design (julho
de 2026). O acompanhamento item a item está no `ROADMAP.md`; as evidências detalhadas
vão no próprio relatório, como o comitê pediu.

### Perfis e permissões

| Ação | Anônimo | Leitor | Admin | Operador |
|---|---|---|---|---|
| Ver a tela de login | ✅ | ✅ | ✅ | — |
| Galeria e ficha dos recursos publicados | — | ✅ | ✅ | — |
| Favoritos próprios e registro das próprias visualizações | — | ✅ | ✅ | — |
| Fila de revisão (recursos fora da galeria) | — | — | ✅ | ✅ |
| Ranking de acessos, status e histórico de importação | — | — | ✅ | ✅ |
| Visualizações de todos os usuários | — | — | ✅ | ✅ |
| Enviar planilha e capturar capas pela interface (só modo Express) | — | — | ✅ | — |
| Criar, editar e excluir recurso pela API, sem tela (só modo Express) | — | — | ✅ | — |
| Preparar e importar planilha, capturar capas, exportar o banco | — | — | — | ✅ |
| Conceder e retirar o papel de admin | — | — | — | ✅ |
| Ler a trilha de auditoria | — | — | — | ✅ |

- **Leitor**: qualquer conta autenticada sem papel.
- **Admin**: conta com `role = admin`, restrito a e-mails `@arcoeducacao.com.br` dos
  times de Interações Digitais e Acervo.
- **Operador**: quem tem a senha do banco ou acesso ao painel do Supabase. Opera
  pela linha de comando e pelo SQL, não pela aplicação.

No ambiente de testes, os botões de acesso rápido da tela de login dão a qualquer
visitante o perfil de leitor ou de admin. Ver "Riscos e pontos de atenção".

**Relatório de usuários e perfis**, para revisão periódica de acessos:

```sql
-- Supabase
select email, coalesce(raw_app_meta_data ->> 'role', 'user') as papel,
       created_at, last_sign_in_at
from auth.users
order by papel, email;

-- Express
select email, role as papel, created_at from users order by role, email;
```

### Trilha de auditoria

Tabela `audit_events`, criada pela migração do Prisma, com RLS ligada e **sem acesso
pela Data API**: nenhum perfil da aplicação lê nem grava nela diretamente. Só a lê
quem opera o banco. Como fica no Postgres, migra junto com ele. Em produção no Supabase
desde 2026-10-20.

| Evento (`action`) | Modo Express | Modo Supabase |
|---|---|---|
| `auth.login` | Rota de login, com IP | Gatilho em `auth.users` (`last_sign_in_at`), sem IP |
| `auth.login_failed` | Rota de login, com motivo e IP | **Não registrado** |
| `auth.role_changed` | Gatilho na tabela `users` | Gatilho em `auth.users` (`raw_app_meta_data`) |
| `catalog.import` e `catalog.import_failed` | Importação: painel, Apps Script ou linha de comando (usuário do sistema ou `ACERVO_OPERADOR`) | A importação roda pelo Prisma e grava igual |
| `catalog.resource_created`, `_updated`, `_deleted` | Rotas de admin de `/api/odas` | Não há essas rotas |

Os gatilhos do Supabase estão em `scripts/supabase/rls.sql` (`audit_auth_user_change`).
Falha ao gravar auditoria vira aviso no log e não bloqueia o login.

Limitações conhecidas:
- **Falha de login no modo Supabase:** o Supabase Auth não expõe a tentativa recusada
  ao banco. O registro existe apenas nos logs do painel, com retenção curta no plano
  Free. `[A VALIDAR]` Quanto tempo esses logs ficam. No ambiente corporativo, o
  JumpCloud registra as falhas.
- **Visibilidade para TI e Segurança:** hoje, só por SQL.
  `[PERGUNTA AO RESPONSÁVEL]` Para onde a Segurança quer que os eventos sejam
  enviados (SIEM, exportação periódica)?

```sql
select occurred_at, action, actor, target, origin, ip, details
from audit_events
order by occurred_at desc
limit 100;
```

### Dados pessoais

Inventário para o mapeamento (ROPA) com a DPO. `[HIPÓTESE — CONFIRMAR]` A base legal
e os prazos são propostas técnicas; quem define é a DPO.

| Dado | Onde fica | Finalidade | Retenção proposta |
|---|---|---|---|
| E-mail, nome (opcional) e papel | `auth.users` (Supabase) ou `users` (Express) | Autenticação e controle de acesso | Enquanto houver vínculo. Com o JumpCloud, o desligamento remove o acesso |
| Hash de senha | `auth.users` ou `users.password_hash` | Autenticação | Igual ao anterior. Deixa de existir com o SSO |
| Favoritos | `auth_favorites` ou `user_favorites` | Conveniência do usuário | Apagados junto com a conta (`on delete cascade`) |
| Visualização por usuário, recurso e dia | `auth_view_events` ou `oda_view_events` | Ordenar a galeria pelos mais vistos | 12 meses identificados, depois removidos. As contagens agregadas em `odas` ficam |
| Trilha de auditoria (e-mail, IP, ação) | `audit_events` | Segurança e rastreabilidade | 12 meses. `[A VALIDAR]` Se o art. 15 do Marco Civil (6 meses de registros de acesso) se aplica |
| Export do banco | `data/export-*`, só na máquina do operador | Migração e backup | Apagado depois do uso |

A planilha oficial do NDE tem nomes e e-mails; o `planilha:preparar` os remove antes
de qualquer coisa entrar no projeto. A planilha original fica no Drive, sob a gestão
do NDE.

`[PERGUNTA AO RESPONSÁVEL]` Os prazos acima ainda não têm rotina de descarte. Ela é
implementada depois que a DPO aprovar os valores.

### Aviso de privacidade

Rascunho para aprovação da DPO, a exibir na tela de login. `[A VALIDAR]` Texto, prazo e
canal são da DPO.

> **Privacidade no Acervo Digital.** O Acervo Digital é uma ferramenta interna da Arco
> para consultar recursos digitais pedagógicos. Para funcionar, ele usa o seu e-mail
> corporativo e, se você informar, o seu nome, para liberar o acesso e definir o seu
> perfil. Também registra quais recursos você abre e marca como favoritos, para ordenar
> a galeria e guardar seus favoritos, e eventos de segurança como entradas, tentativas
> recusadas e mudanças de perfil, com data, hora e endereço IP. Esses dados não são
> compartilhados fora da Arco e são mantidos por [prazo definido pela DPO]. Para pedir
> acesso, correção ou eliminação dos seus dados (art. 18 da LGPD), fale com [canal da
> DPO].

### MFA

**Risco aceito no ambiente de testes**, por decisão do responsável em 2026-10-20: não
há contas individuais nem dado sensível no catálogo. O MFA chega com o JumpCloud no
ambiente corporativo. O relatório recomenda MFA provisório até lá; essa decisão
precisa constar na resposta ao comitê.

### Gestão de segredos

Pendente. `[PERGUNTA AO RESPONSÁVEL]` Qual é o cofre corporativo? A resposta é da
Segurança. Quando estiver definido: guardar lá a senha do banco, o `JWT_SECRET` e o
`SPREADSHEET_SYNC_TOKEN`, e rotacionar a senha do banco, revendo a decisão de setembro
de 2026 de não rotacioná-la.

### Validações automáticas

| Tipo | Ferramenta | Onde |
|---|---|---|
| SCA | `npm audit --omit=dev --audit-level=high` no front e na API; reprova o build | `.github/workflows/ci-e-deploy.yml` |
| SCA | Dependabot, atualização semanal de npm e de actions | `.github/dependabot.yml` |
| SAST | CodeQL com as consultas `security-extended` | `.github/workflows/seguranca.yml` |
| IaC | Trivy nos Dockerfiles e workflows; só reporta, não reprova | `.github/workflows/seguranca.yml` |

Os achados de CodeQL e Trivy aparecem na aba *Security → Code scanning* do GitHub. O
workflow também roda toda segunda-feira, para pegar vulnerabilidade nova sem commit.

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
# 1. Baixe a planilha oficial do Drive do NDE (.xlsx) e prepare a cópia de importação.
#    Ela é gravada em data/ com o nome oficial; a pasta data/ não vai para o Git.
npm run planilha:preparar -- "C:/Users/voce/Downloads/planilha-baixada.xlsx"
#    Depois apague o arquivo baixado, que tem todas as abas e os dados pessoais.

# 2. Confira o que vai mudar em relação à última importação, sem tocar no banco:
npm run diff:planilha

# 3. Aplique no banco:
npm run import:categorizacao

# 4. Gere as capas que faltam (a lista vem da planilha; -- --do-banco usa o banco):
npm run thumbs:capture

# 5. Publique as capas. Elas só aparecem no site depois do push:
git add public/thumbs
git commit -m "chore(acervo): capas da planilha nova"
git push
```

Numa máquina nova, o passo 1 cria a pasta `data/`. Sem `data/ultima-importada.xlsx`,
o `diff:planilha` pede a planilha anterior como argumento
(`npm run diff:planilha -- caminho/da/anterior.xlsx`).

O passo 3 imprime quantos recursos foram criados, atualizados, desativados e quantos
estão sem capa. Os mesmos números ficam registrados em `import_events` e aparecem no
painel admin, na aba de histórico, com data, hora e a capa de cada item.

O passo 5 dispara o build da Vercel automaticamente. O banco já está atualizado
desde o passo 3, então o catálogo muda antes das capas.

### Importar em fases, quando faltam muitas capas

Se a planilha nova traz muitos recursos sem capa, a ordem se inverte para a galeria
não exibir cards vazios:

```bash
# 1. Capture um lote de capas. A lista vem da planilha, então inclui os recursos
#    que o banco ainda não tem:
npm run thumbs:capture -- --limit=100
# 2. Publique as capas (git add / commit / push) e espere o deploy da Vercel.
# 3. Importe só o que já tem capa:
npm run import:categorizacao:com-capa
```

Com `--somente-com-capa`, recurso **novo** que entraria na galeria sem capa não é
criado e fica para a próxima rodada; o resumo mostra quantos foram adiados. Recursos
já cadastrados são atualizados normalmente e nada é desativado por ter sido adiado.
Repita os passos a cada lote de capas.

### Recapturar capas que saíram erradas

Quando a captura pegou uma tela de carregamento em vez do recurso:

```bash
npm run thumbs:capture -- --validate-existing
```

Quando a capa está ruim por outro motivo (cortada, no meio de uma animação), apague o
arquivo na pasta da marca e rode `npm run thumbs:capture`: a captura refaz o que
estiver faltando.

### Mudar a regra do caminho das capas

A migração para pastas por marca foi feita em 20/10/2026 com um script temporário,
já removido; ele está no histórico do Git (`server/scripts/organize-thumbs.ts`).
Se a regra de `thumbPaths.ts` mudar de novo, a ordem que evita card sem capa é:
copiar as capas para o caminho novo, publicar, rodar a importação (que regrava
`odas.imagem`), atualizar `import_events.imagem` e só então apagar o caminho antigo.
Não há SQL manual nem migração: a coluna é a mesma, só o valor muda.

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

### Aplicar mudanças de banco

Nada é aplicado automaticamente no Supabase. A ordem importa: as migrações criam as
tabelas e o `rls.sql` cria as políticas e os gatilhos que dependem delas.

```bash
# 1. Migrações do Prisma, com o server/.env apontando para o Supabase (DIRECT_URL):
npm run prisma:migrate
```

2. Cole `scripts/supabase/rls.sql` inteiro no *SQL Editor* do Supabase e execute. O
   script é idempotente: pode ser rodado de novo sem efeito colateral.

### Promover ou rebaixar administrador

Não há tela para isso, por decisão: o papel é concedido direto no banco, só para
e-mails `@arcoeducacao.com.br` dos times de Interações Digitais e Acervo. No *SQL
Editor* do Supabase:

```sql
-- Quem é admin hoje (só app_metadata vale; user_metadata é ignorado)
select email, raw_app_meta_data->>'role' as papel
from auth.users
where raw_app_meta_data->>'role' = 'admin';

-- Promover
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
where email = 'pessoa@arcoeducacao.com.br';

-- Rebaixar
update auth.users
set raw_app_meta_data = raw_app_meta_data - 'role'
where email = 'pessoa@arcoeducacao.com.br';
```

A mudança vale no próximo login da pessoa, quando um JWT novo é emitido. No modo
Express, o equivalente é a coluna `role` da tabela `users`.

### Migrar para o servidor corporativo

O destino ainda não existe. O que já está pronto para a migração ser só execução:

- **Esquema:** as migrações do Prisma recriam todas as tabelas de catálogo, de
  usuários do Express e de auditoria em qualquer Postgres (`npm run prisma:migrate`).
- **Dados:** `npm run db:exportar` gera em `data/export-AAAAMMDD-HHMM/` um JSON por
  tabela: catálogo com os contadores de visualização, histórico de importação,
  auditoria, favoritos, visualizações e usuários (e-mail e papel; nunca o hash de
  senha). Também serve de backup.
- **Catálogo:** pode ser reconstruído do zero pela planilha (`planilha:preparar` e
  `import:categorizacao`). O export só é necessário para preservar contadores,
  favoritos e histórico.
- **Capas:** vão com o código, em `public/thumbs/`.
- **Identidade:** no servidor, quem identifica é o JumpCloud. Favoritos e
  visualizações do Supabase são religados pelo **e-mail**, usando
  `users_supabase.json` do export.

Sequência prevista:

1. `npm run db:exportar` contra o Supabase.
2. No servidor: Postgres, `server/.env` com o `DATABASE_URL` novo,
   `npm run prisma:migrate`.
3. Importar a planilha preparada e capturar as capas que faltarem.
4. Restaurar contadores, favoritos e histórico a partir do export.
   `[A VALIDAR]` Ainda não há comando de restauração; ele é escrito quando o destino
   e o modelo de identidade do JumpCloud estiverem definidos.
5. Subir com `VITE_BACKEND=ec2` e `docker compose up --build -d`. A pasta `./data`
   é montada na API.
6. Manter o Supabase até validar o servidor. Depois, apagar os exports.

`[PERGUNTA AO RESPONSÁVEL]` No servidor, o Postgres é local ou um serviço gerenciado
da TI?

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
| `unable to get local issuer certificate` no `prisma generate` ou no `thumbs:setup` | Proxy corporativo com inspeção TLS | Node 23.8+ usa a cadeia do Windows com `setx NODE_USE_SYSTEM_CA 1` (abrir terminal novo). Não desligar a validação TLS |
| Docker Desktop: *Virtualization support not detected* | Recursos "Plataforma de Máquina Virtual" e WSL desligados no Windows, mesmo com virtualização ligada na BIOS | `wsl --install --no-distribution` como administrador e reiniciar; em máquina corporativa, pode exigir a TI. Para só consultar o catálogo, use o modo Supabase, que não precisa de Docker |
| Galeria com menos recursos que o esperado no modo Supabase | Limite de "Max rows" da Data API (1000 por padrão) | `supabaseFetchOdas` pagina a consulta desde 2026-10-19. Se voltar a ocorrer, conferir se alguma consulta nova de listagem deixou de paginar |

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
- `npm audit --omit=dev --audit-level=high` sem achados no front e na API (o CI
  reprova). Achados de CodeQL e Trivy revisados na aba *Security* do GitHub.
- Operação que altera dado ou permissão grava em `audit_events`, nos dois backends.
- Planilha nunca entra em `public/` nem no Git; dado pessoal da planilha nunca entra
  no projeto.

---

## Riscos e pontos de atenção

**A operação depende de uma máquina, não de um servidor.** Importar planilha e
capturar capas exige Node, Playwright e a senha do banco num computador. Se ninguém
tiver esse ambiente, o catálogo congela. É o maior risco do projeto hoje.

**O plano Free do Supabase pausa por inatividade.** Existe mitigação, mas ela mora
num workflow do GitHub que o próprio GitHub desativa se o repositório ficar parado.

**Um único projeto Supabase.** Desde 2026-10-20, só o `iezvzcrmzdfljvbbdneu` está em
uso; o antigo `adungjmhuibxvgiqrume` ("Acervo Digital - Arco") saiu de uso. Se ele ainda
aparecer na conta, ignore: a configuração vale só no `iezvzcrmzdfljvbbdneu`.

**A senha do banco Supabase circulou em conversa de chat** durante a migração. Ficou
decidido **não rotacioná-la**: a conversa foi interna e o risco foi avaliado e aceito
pelo responsável. A senha continua sendo tratada como segredo e não entra no
repositório.

**A instância EC2 está inacessível.** SSH na porta 22 não responde e não há acesso ao
console AWS para investigar. Enquanto isso, o gatilho diário do Apps Script está
parado, porque aponta para a API daquela instância.

**O modal de vídeo depende de embed.** Desde 2026-10-19 só o audiovisual abre no
`iframe`; ODAs abrem em nova guia porque, embarcados, parte deles cortava o conteúdo
ou não carregava. Um vídeo hospedado fora do Vimeo/YouTube que recuse `iframe` abriria
em branco no modal.

**Autenticação sem SSO.** Usuários com senha definida manualmente e o botão
JumpCloud sem função. A proteção contra senha vazada do Supabase Auth está
desligada — decisão consciente enquanto não há base real de usuários.

**Acesso admin compartilhado no ambiente de testes.** O botão "Acesso admin
(provisório)" entra com credencial fixa no front, então qualquer pessoa com a URL
vira admin. Aceitável só enquanto a Vercel for ambiente de testes sem dado sensível;
sai quando o JumpCloud entrar.

**Este repositório é público no GitHub.** Toda documentação aqui é legível por
qualquer pessoa. A planilha completa, com e-mails e nomes de avaliadores, ficou no
histórico do Git até 2026-10-20. Decisão do responsável: manter o repositório
público até a migração para o GitHub da ArcoTech, que deve levar um **histórico
limpo**, sem esse arquivo.

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

- `[PERGUNTA AO RESPONSÁVEL]` No servidor corporativo, o banco oficial passa a ser o
  Postgres desse servidor ou o Supabase continua? Em outubro de 2026 ficou decidido
  que a Vercel com o Supabase é o ambiente de testes e que o destino é um servidor
  da Arco com JumpCloud; falta definir onde ficam os dados.
- `[A VALIDAR]` Se o comitê aceita JumpCloud com MFA no lugar da VPN. É hipótese do
  responsável, não decisão do comitê.
- `[A VALIDAR]` Se algum vídeo do catálogo está hospedado fora do Vimeo/YouTube e
  recusa `iframe` no modal.
- `[A VALIDAR]` Backup do banco: o `npm run db:exportar` existe desde 2026-10-20, mas
  roda manualmente. Falta definir periodicidade e onde guardar o export, que tem dado
  pessoal.
- `[PERGUNTA AO RESPONSÁVEL]` Para a DPO: base legal do tratamento, prazos de
  retenção, texto final do aviso de privacidade e canal para os direitos do titular.
- `[PERGUNTA AO RESPONSÁVEL]` Para a Segurança: qual é o cofre corporativo e para onde
  enviar a trilha de auditoria.
