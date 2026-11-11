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
| `VITE_BACKEND=supabase` | Supabase Auth + Data API (PostgREST) falando direto com o Postgres, protegido por RLS | **Base oficial atual** do acervo, na Vercel com Supabase Free (MVP) |
| `VITE_BACKEND=ec2` | API Express + Prisma em `server/`, com JWT próprio | Desenvolvimento local e **caminho para o ambiente corporativo** |

Isso não é acidente nem sobra de migração. Hoje, o Supabase é a base oficial: é
dele que o acervo exibe os recursos, e a planilha alimenta esse banco pela
importação. O MVP ainda roda como ambiente de testes, na Vercel. O futuro é a
infraestrutura da Arco, com o SSO JumpCloud, e o backend que roda num servidor é o
Express. `src/utils/api/` é o ponto único de desvio entre os dois.

## Escopo atual

- Autenticação e sessão.
- Galeria autenticada com busca textual, filtros combináveis, paginação e dois modos
  de exibição.
- Ficha do recurso com metadados pedagógicos, BNCC e relacionados.
- Abertura do recurso: vídeo em modal de tela ampliada; ODA, playlist e demais em
  nova guia.
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

Revisados contra o código em 2026-10-21.

### Mapa geral

```
                    NDE (Drive da empresa)
                    Planilha de categorização
                              │ download manual
                              ▼
   Máquina do operador ─ planilha:preparar ─ diff:planilha ─ import:categorizacao
          │                                                        │
          │ thumbs:capture → public/thumbs → git push               │ Prisma (SSL)
          ▼                                                        ▼
   GitHub ── CI (tipos, testes, audit, build) ──► Vercel     Supabase (sa-east-1)
                                                   │          odas · import_events
                                                   │          import_issues · audit_events
                                                   │          auth.users · favoritos · visitas
                                                   ▼                 ▲
                                        Navegador (React)  ── Data API + RLS ──┘
                                         ├─ Leitor: galeria, ficha, favoritos
                                         └─ Admin: fila de revisão, histórico,
                                            ranking, usuários e perfis (só leitura)
```

O Express em `server/` atende o mesmo front no desenvolvimento local
(`VITE_BACKEND=ec2`) e é o caminho para a infraestrutura da Arco.

### Fluxo do dado editorial

```
Planilha de categorização do NDE (Drive da empresa, todas as abas)
        │
        │  download manual
        │  npm run planilha:preparar   (só a aba Recursos Digitais, só valores,
        │                               sem a coluna Avaliador) → data/
        │  npm run diff:planilha       (o que muda antes de gravar)
        │  npm run import:categorizacao   (rodado na máquina do operador)
        ▼
PostgreSQL no Supabase
  ├─ odas            toda linha com código real; ativa, mesmo quebrada
  ├─ import_events   o que foi criado, alterado, reativado ou desativado
  ├─ import_issues   linha sem código e código repetido (recriada a cada importação)
  └─ audit_events    quem importou, quando e o resumo
        │
        │  Data API (PostgREST) com RLS
        ▼
Front na Vercel
  ├─ galeria e ficha: só Funcionando + link
  └─ admin: o resto, na fila de revisão
```

### Ciclo de correção com o NDE

```
Fila de revisão (admin)  ──►  NDE corrige a planilha  ──►  nova importação
  sem código · código repetido          │                        │
  sem link · quebrado · incorreto       │                        ▼
  acesso restrito · não avaliado        │            item corrigido entra na galeria;
  em cadastro · outro                   │            o problema some da fila
                                        └── a fila mostra a linha da planilha
```

Os grupos "Sem código" e "Código repetido" vêm de `import_issues`, não de recursos:
mostram a linha da planilha e, no código repetido, qual linha ficou valendo.

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
Interações Digitais (ID) e do Núcleo de Design Educacional (NDE). Com o JumpCloud,
todo usuário autenticado entra como leitor; o admin é dado pelo banco.

Enquanto o JumpCloud não chega, a tela de login tem dois botões de acesso rápido com
credenciais fixas no front (`src/components/LoginPage.tsx`): um de leitura e um de
admin provisório. Quem tem a URL do ambiente de testes entra como admin. É o login
único do MVP, para demonstrar a ideia (decisão de 2026-10-21).

No Supabase, o admin **só lê**: as políticas de `odas` e das tabelas de importação
são de `select`, e não há rota de escrita. Ele vê a fila de revisão, o histórico, o
ranking e o relatório de usuários. Importar, capturar capas e mudar papel é do
operador, pela linha de comando e pelo banco.

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
  (`src/utils/catalogLoadError.ts`) e oferece "Tentar novamente". Fora do modo
  Express, nenhuma mensagem cita fornecedor nem plano (um teste confere):
  - Banco pausado (mensagem `paused` ou código `540`): "Acervo temporariamente
    indisponível" / "O Acervo está temporariamente indisponível (ambiente de teste).
    Tente novamente ou avise o time de Interações Digitais."
  - Falha de conexão, no login e na galeria: "Não foi possível conectar ao Acervo.
    Pode ser a internet ou o ambiente de teste. Tente de novo em alguns minutos. Se
    continuar, avise o time de Interações Digitais." O navegador muitas vezes
    esconde o corpo do erro, então a pausa também pode chegar como falha de conexão.
  - Com o catálogo em falha, a galeria mostra só o aviso: sem "Nenhum ODA
    encontrado" nem "ODAs Recomendados" vazio (`GalleryResults`, prop `unavailable`).
  - As instruções de desenvolvimento (`server:dev`, `prisma:migrate`) só aparecem no
    modo Express. A fila do admin usa os mesmos textos.
- **Minha Conta e recuperação de senha no Supabase:** "Neste ambiente de teste, nome e
  senha não podem ser alterados." e "Neste ambiente de teste, a senha não pode ser
  redefinida por aqui. Fale com o time de Interações Digitais."
- **Menu do botão direito no card:** um item só, "{Abrir ODA/vídeo/…} em nova guia"
  (`ProjectContextMenu.tsx`). Abrir na mesma guia tirava a pessoa do Acervo.
- **Orientações metodológicas:** `public/metodologia/` não tem nenhum PDF versionado
  (conferido em 2026-11-03), então o botão "Baixar Orientações Metodológicas (PDF)"
  aparece sempre desativado na ficha.
- **Página 404:**
  - Rota interna desconhecida (`#/xyz`) e link de recurso que o catálogo não tem
    (`#/recurso/<codigo>`) abrem `NotFoundPage`. O link de recurso mostra o código
    pedido.
  - Endereço inexistente fora do hash (`/xyz`) recebe `public/404.html`, página
    estática servida pela Vercel. `#/home`, da versão anterior, continua levando ao
    login.

### Fluxo de visualização

O front chama a RPC `record_oda_view()` (Supabase) ou `POST /api/odas/:id/view`
(Express). Há deduplicação: um mesmo usuário conta uma vez por recurso por dia, no
fuso de São Paulo. Dois tipos são distinguidos: `page` (abriu a ficha) e `open`
(abriu o recurso de fato).

Quando a visita conta, três coisas acontecem numa transação: a linha individual do
dia é gravada (só para a deduplicação), o contador do recurso em `odas` sobe e o
total do dia em `oda_view_daily` sobe. Em seguida, as linhas individuais de dias
anteriores são apagadas. O ranking de 7 e 30 dias soma `oda_view_daily`: no
Supabase, pela função `admin_top_views()`, que só responde a admin; no Express, pela
rota `/api/admin/views/top`. O ranking "Total" lê os contadores de `odas`.

Efeito aceito: depois do dia, não dá mais para saber quem viu o quê. Isso também
vale para o relatório de usuários, que não mostra visualizações por pessoa.

---

## Arquitetura e stack identificadas

| Camada | Tecnologia |
|--------|-----------|
| Front | React 18, TypeScript, Vite 6, Radix UI, Lucide, Intro.js |
| Estilo | Tailwind **compilado e congelado** em `src/index.css` + CSS por componente |
| API (modo ec2) | Node.js, Express, TypeScript, Prisma 7, JWT, bcrypt |
| API (modo supabase) | Supabase Data API (PostgREST) + Auth, protegidos por RLS |
| Banco | PostgreSQL 16. Produção: Supabase, região `sa-east-1`, plano Free. Local: Docker na porta **5433** |
| Capas | Playwright (Chromium) + Sharp |
| Planilha | ExcelJS |
| Testes | Vitest, apenas testes unitários de utilitários |
| Segurança no CI | `npm audit`, CodeQL, Trivy e Dependabot (ver "Segurança e privacidade") |
| Mapa do código | Graphify, ferramenta local de desenvolvimento, fora das dependências (ver `README.md`) |
| Hospedagem | Vercel (front). Docker Compose sobe o Postgres local e, no perfil `app`, o Acervo inteiro em container para validação (ver "Subir o Acervo em container") |
| Container | API: `server/Dockerfile` (Node 24 sobre Debian 13, sem root). Site: `Dockerfile` (build no modo Express, nginx sem root em `docker/nginx.conf`) |
| Automação | GitHub Actions: CI de verificação, build e subida dos containers, e ping semanal no Supabase |

### Organização das pastas

```
src/
  components/     páginas e componentes de interface
  config/         backend.ts decide entre Express e Supabase
  contexts/       AuthContext
  hooks/          filtros da galeria, tamanho de página, catálogo (useCatalog),
                  favoritos (useFavorites)
  utils/          api/ (desvio), supabaseApi.ts, catalogVisibility.ts, galleryLayout.ts
    api/          index.ts (entrada), auth, favorites, catalog, admin, types, http
                  (chamadas ao Express) e odaToProject (registro do banco → card)
  guidelines/     diretrizes de interface
server/
  routes/         odas, auth, admin, favorites, bncc, sync
  lib/            map-categorizacao, spreadsheetSync, catalogVisibility, thumbPaths, excel,
                  odaViews, prisma, databaseConnection, retention
  prisma/         schema.prisma e 11 migrações
  prisma.config.ts  configuração do CLI do Prisma (schema, migrações e DIRECT_URL)
  scripts/        import-categorizacao, capture-thumbs, diff-planilha, preparar-planilha,
                  exportar-banco, descartar-dados, relatorio-nde, seed, setup-playwright
public/
  thumbs/         capas .webp versionadas, uma pasta por marca (sae/, conquista/...)
  bncc.db
data/             planilha de categorização, fora do Git (ver "Dados, entradas e saídas")
scripts/
  supabase/rls.sql          políticas e funções do Supabase
  apps-script/sync-acervo.gs gatilho diário (parado; endereço HTTPS da API e token nas propriedades do script)
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
`import_events` (histórico de importação), `import_issues` (problemas da planilha na
última importação, só admin lê), `audit_events` (trilha de auditoria),
`oda_view_daily` (total de visualizações por recurso, tipo e dia, sem pessoa),
`keep_alive` (uma linha, só para o ping).

**Tabelas de usuário, duplicadas por backend:**

| Modo Express | Modo Supabase |
|---|---|
| `users` | `auth.users` (gerenciado pelo Supabase) |
| `user_favorites` | `auth_favorites` |
| `oda_view_events` | `auth_view_events` |

Essa duplicação é consequência de o Supabase gerenciar a identidade. **Favoritos
criados num modo não aparecem no outro.**

**Objetos SQL no Supabase** (definidos em `scripts/supabase/rls.sql`):
`is_acervo_admin()`, `record_oda_view()` e `admin_top_views()`, todas
`SECURITY DEFINER` com `EXECUTE` concedido apenas ao papel `authenticated`;
`admin_top_views()` ainda recusa quem não é admin. RLS está habilitada em todas as
tabelas públicas, inclusive `_prisma_migrations` e `oda_view_daily`, que têm todo
acesso revogado.

**Volume:** mais de 2 mil recursos (o número exato está no painel admin) e mil e
trezentas habilidades BNCC.

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

**Cadastrar não é publicar.** Desde 2026-10-21, a importação cadastra toda linha
com código real (`isImportableResource`, em `server/lib/catalogVisibility.ts`),
inclusive quebrada, incorreta, não avaliada, com acesso restrito ou sem link. Essas
ficam ativas no banco e fora da galeria. Entre 20 e 21/10 a regra foi a oposta (só
cadastrar o que entra na galeria); voltou porque o admin precisa ver o que está
pendente e porque uma planilha nova pode corrigir o item. Linha sem código continua
fora: o código provisório muda quando a linha muda de lugar.

A **fila de revisão** do admin mostra o que estiver ativo fora da regra, agrupado em:
sem link, quebrado, incorreto, acesso restrito, dúvida para revisão, não avaliado, em
cadastro, outro. É o controle do que está pendente com o NDE.

**Código repetido na planilha:** a linha que entra na galeria vence a que não entra
(`createRepeatedCodeResolver`). Entre duas do mesmo tipo, vale a última. Todo código
repetido aparece no resumo da importação, para correção editorial.

### Sincronização pelo código do recurso

| Situação na planilha | Efeito no banco |
|---|---|
| Linha sem código do recurso | Não cadastra; se já existia, **desativa** |
| Linha não `Funcionando` ou sem link | Cadastra ou atualiza, ativa, **fora da galeria** e na fila de revisão |
| Código novo | Cria o recurso |
| Código existente com campo alterado | Atualiza |
| Código existente sem alteração | Só marca a data de sincronização |
| Código que saiu da planilha | **Desativa** (`ativo = false`) e sai da galeria |
| Código que voltou à planilha | Reativa |
| Item pendente que passou a `Funcionando` com link | Entra na galeria na mesma importação |

Nada é apagado. O `--clear` existe no script e **não deve ser usado na rotina**.

Linha sem código recebe o identificador provisório `PLANILHA_L{número da linha}` e não
é cadastrada.

**Códigos repetidos.** O resumo da importação lista cada código que aparece em mais de
uma linha, com os números das linhas (`findRepeatedCodes`), e quantas linhas repetidas
foram ignoradas. A linha que entra na galeria vence; entre iguais, a última. Assim o
recurso `Funcionando` não é escondido por uma cópia `Não avaliado` mais abaixo. Códigos
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
interface, aplicada em `apiODAToFrontend` (`src/utils/api/odaToProject.ts`), por onde passam os
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
| Relatório de usuários e perfis (aba do admin e SQL) | — | — | ✅ | ✅ |
| Enviar planilha e capturar capas pela interface (só modo Express) | — | — | ✅ | — |
| Criar, editar e excluir recurso pela API, sem tela (só modo Express) | — | — | ✅ | — |
| Preparar e importar planilha, capturar capas, exportar o banco | — | — | — | ✅ |
| Conceder e retirar o papel de admin | — | — | — | ✅ |
| Ler a trilha de auditoria | — | — | — | ✅ |

- **Leitor**: qualquer conta autenticada sem papel.
- **Admin**: conta com `role = admin`, restrito a e-mails `@arcoeducacao.com.br` dos
  times de Interações Digitais (ID) e do NDE.
- **Operador**: quem tem a senha do banco ou acesso ao painel do Supabase. Opera
  pela linha de comando e pelo SQL, não pela aplicação.

No ambiente de testes, os botões de acesso rápido da tela de login dão a qualquer
visitante o perfil de leitor ou de admin. Ver "Riscos e pontos de atenção".

**Relatório de usuários e perfis**, para revisão periódica de acessos. Dois caminhos
com o mesmo resultado:

- **Painel admin**, aba *Usuários e perfis*: e-mail, perfil, data de criação e último
  acesso, com botão "Exportar CSV". No Supabase, a tela chama a função
  `admin_list_users()` (`rls.sql`), que recusa quem não é admin e registra
  `admin.users_listed` na trilha. No Express, a rota `GET /api/admin/users` faz o
  mesmo e tira o último acesso dos eventos `auth.login`. O CSV usa `;` e neutraliza
  células que o Excel leria como fórmula.
- **SQL**, para quem opera o banco:

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
| `admin.users_listed` | Rota `GET /api/admin/users`, com IP | Função `admin_list_users()`, sem IP |

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

Inventário para o mapeamento (ROPA) com a DPO. A base legal, definida no mapeamento
da DPO, é o **legítimo interesse** (LGPD, art. 7º, IX), tanto para a vitrine quanto
para a auditoria. O mapeamento também confirma que não há dados sensíveis, dados de
crianças nem decisão automatizada.

| Dado | Onde fica | Finalidade | Retenção |
|---|---|---|---|
| E-mail, nome e papel | `auth.users` (Supabase) ou `users` (Express) | Autenticação, controle de acesso e exibição do nome de quem está logado | Enquanto houver vínculo. Com o JumpCloud, o nome vem do diretório e o desligamento remove o acesso |
| Hash de senha | `auth.users` ou `users.password_hash` | Autenticação | Igual ao anterior. Deixa de existir com o SSO |
| Favoritos | `auth_favorites` ou `user_favorites` | Conveniência do usuário | Apagados junto com a conta (`on delete cascade`) |
| Visualização por usuário, recurso e dia | `auth_view_events` ou `oda_view_events` | Contar uma visita por pessoa por dia | **Só o dia corrente.** A cada visita, e no descarte, as linhas de dias anteriores são apagadas |
| Total diário de visualizações, sem pessoa | `oda_view_daily` | Ranking de 7 e 30 dias do admin | Não é dado pessoal: recurso, tipo, dia e total. Sem prazo |
| Trilha de auditoria (e-mail, IP, ação) | `audit_events` | Segurança e rastreabilidade | **6 meses**, pelo art. 15 do Marco Civil, conforme o mapeamento da DPO |
| Export do banco | Pasta restrita do time de ID no Drive corporativo; `data/export-*` na máquina do operador só até o envio | Backup e migração | Antes de cada importação e no mínimo mensal. `[A VALIDAR]` Quantos exports manter |

A planilha oficial do NDE tem nomes e e-mails; o `planilha:preparar` os remove antes
de qualquer coisa entrar no projeto. A planilha original fica no Drive, sob a gestão
do NDE.

**Descarte por prazo.** `npm run db:descartar` apaga a auditoria mais antiga que 6
meses e as visualizações individuais de dias anteriores, nos dois backends. A
importação da planilha chama o mesmo descarte ao terminar sem erro. Cada descarte
grava o evento `data.discarded` na auditoria, com as quantidades apagadas. O prazo
fica em `server/lib/retentionPolicy.ts`.

**Fim do MVP.** O mapeamento da DPO pede que os dados de teste sejam revistos e
apagados ao término da fase de validação. O procedimento está no runbook, em
"Encerrar o ambiente de testes".

### Aviso de privacidade

**Hoje (orientação da DPO, 2026-11-05):** a política de privacidade do Grupo é única.
Até o aviso próprio do Acervo ficar pronto, o Acervo aponta para a
[Política de Privacidade da Arco](https://politicaprivacidade.arcoeducacao.com.br/),
que abre em nova guia. O link aparece em dois lugares: na tela de login, antes de
entrar, e no menu do perfil, a qualquer momento depois. O endereço fica em
`src/utils/privacyPolicy.ts`. O Acervo não copia o texto da política, porque quem o
mantém é a Arco.

O texto do login é só informativo ("Ao iniciar sessão, você reconhece que leu a
Política de Privacidade.", desde 2026-11-11), e não pede concordância, porque a base
legal é o legítimo interesse, não o consentimento. Também não cita Termos de Serviço,
que o Acervo não tem.

**Aviso próprio do Acervo:** depende do mapeamento da DPO. Segundo ela, o aviso deve
dizer a quem se aplica, quais dados o Acervo trata, a finalidade, a base legal, o
tempo de retenção, o canal do titular, a identidade do DPO, com quem os dados são
compartilhados e se há transferência internacional. Quando ficar pronto, ele aparece
dentro do Acervo e aponta para a política completa da Arco.

**Banner de cookies:** a DPO confirmou que ele é necessário, mesmo com o Acervo
usando só armazenamento local (`localStorage`). Ele fica para depois do texto da DPO
(decisão do responsável, 2026-11-05). `[A VALIDAR]` Texto e formato do banner (só
informativo ou com escolha) são da DPO.

Rascunho do aviso próprio, para aprovação da DPO. `[A VALIDAR]` Texto, prazo e canal
são da DPO.

> **Privacidade no Acervo Digital.** O Acervo Digital é uma ferramenta interna da Arco
> para consultar recursos digitais pedagógicos. Para funcionar, ele usa o seu e-mail
> corporativo e, se você informar, o seu nome, para liberar o acesso e definir o seu
> perfil. Também registra quais recursos você abre e marca como favoritos, para ordenar
> a galeria e guardar seus favoritos, e eventos de segurança como entradas, tentativas
> recusadas e mudanças de perfil, com data, hora e endereço IP. Esses dados não são
> compartilhados fora da Arco e são mantidos por [prazo definido pela DPO]. Para pedir
> acesso, correção ou eliminação dos seus dados (art. 18 da LGPD), fale com [canal da
> DPO].

### Criptografia em repouso e em trânsito

Responde aos requisitos mínimos "Criptografia em repouso" e "HTTPS/TLS em todas as
comunicações". Evidência coletada em 2026-10-21 na documentação pública dos
provedores:

| Camada | Garantia | Fonte |
|---|---|---|
| Banco, Auth e Storage (Supabase) | "All customer data is encrypted at rest with AES-256 and in transit via TLS." | [supabase.com/security](https://supabase.com/security), seção *Data Encryption* |
| APIs do Supabase (Auth, Data API) | Só aceitam HTTPS, com TLS 1.2 ou 1.3 | [Secure configuration of Supabase platform](https://supabase.com/docs/guides/security/platform-security), seção *TLS for project APIs* |
| Site (Vercel) | Todo deploy é servido por HTTPS; HTTP recebe redirecionamento 308, que não pode ser desligado. TLS 1.2 e 1.3, HSTS com *preload* em `*.vercel.app` | [vercel.com/docs/encryption](https://vercel.com/docs/encryption) |
| Residência dos dados | Projeto na região `sa-east-1` (São Paulo): banco, Auth e Storage ficam nela | [supabase.com/security](https://supabase.com/security), seção *Data Residency* |
| Conexão direta ao Postgres (importação, migração, API Express) | Host remoto sempre com TLS, mesmo sem `sslmode` na URL; `verify-full` valida o certificado. Conferido no Supabase em 2026-11-04 (socket TLS cifrado) | `server/lib/databaseConnection.ts` |

O Supabase aceita, por padrão, conexão Postgres sem SSL, para compatibilidade. A
opção *Enforce SSL* (*Settings → Database → SSL Configuration*) recusaria as que não
usam. Decisão do responsável (2026-10-21): não ativar, porque o Supabase não é o
ambiente oficial; no servidor da Arco o SSL do banco é exigido desde o início.

**Backup:** pela mesma página, só bancos de planos pagos têm backup diário. No plano
Free não há cópia automática; a proteção é o `npm run db:exportar` manual.

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
| IaC | Trivy nos Dockerfiles, no Compose e nos workflows; só reporta, não reprova | `.github/workflows/seguranca.yml` |
| Container | Build das duas imagens, subida com o Postgres e teste de site, saúde, login e catálogo pelo nginx; reprova o build | `.github/workflows/ci-e-deploy.yml`, job "Container" |

Os achados de CodeQL e Trivy aparecem na aba *Security → Code scanning* do GitHub. O
workflow também roda toda segunda-feira, para pegar vulnerabilidade nova sem commit.

---

## Rotina de operação (runbook)

**Esta é a seção que mantém o acervo funcionando.** Quem assume o projeto deve
executar o item "Preparar a máquina" antes de precisar dele.

### Preparar a máquina (uma vez)

Requisitos: Node.js 24, Git e Docker Desktop (o Docker só é necessário
para desenvolver contra o banco local).

```bash
git clone https://github.com/Luizsb/Acervo-Digital.git
cd Acervo-Digital
npm ci
cd server && npm ci && cd ..
npm run thumbs:setup      # instala o Chromium usado na captura de capas
```

Quem só vai analisar o projeto, sem operar o catálogo, clona o repositório
corporativo (`https://github.com/arcotech-services/id-acervo-digital.git`, branch
`develop`) e segue "Subir o Acervo em container". Quem opera precisa dos dois
remotos: ver "Manter os dois repositórios".

### Manter os dois repositórios

Desde 2026-11-10, até existir o servidor da Arco, o código vive em dois lugares
(decisão do responsável):

| Repositório | Remoto local | Branch | Papel |
|---|---|---|---|
| [Luizsb/Acervo-Digital](https://github.com/Luizsb/Acervo-Digital) (público) | `origin` | `main` | Deploy da Vercel e ambiente de testes no Supabase. Nada muda aqui |
| [arcotech-services/id-acervo-digital](https://github.com/arcotech-services/id-acervo-digital) (privado) | `corporativo` | `develop`, por pull request | Análise e validação pelo time; fonte única quando o servidor existir |

Os históricos são independentes: o corporativo começou num template da ArcoTech e
recebeu a árvore do público num commit só, sem o histórico. Por isso o mesmo commit
não vai para os dois; cada mudança é feita na `main` pública e copiada para o
corporativo com `cherry-pick`.

**Diferenças permanentes**, que só existem no corporativo:

- `.key_cti`, que veio do template da ArcoTech. Não apagar.
- `server/seed/catalogo-demo.json` versionado e a linha dele fora do `.gitignore`.
  No público, o arquivo continua ignorado.

**Preparar (uma vez):**

```bash
git remote add corporativo https://github.com/arcotech-services/id-acervo-digital.git
git fetch corporativo
```

**A cada mudança:**

```bash
git switch main
# ... commit da mudança ...
git push origin main                                # deploy na Vercel
git fetch corporativo
# Pasta separada para a branch do corporativo (git worktree): trocar de branch nesta
# pasta apagaria o catalogo-demo.json local, que é versionado só lá.
git worktree add ../acervo-sync -b sync/nome-curto corporativo/develop
git -C ../acervo-sync cherry-pick <commit>          # um ou mais commits da main
git -C ../acervo-sync push -u corporativo sync/nome-curto   # e abrir o pull request
git worktree remove ../acervo-sync
```

Se o `cherry-pick` der conflito, quase sempre é no `.gitignore`: mantenha a linha do
`catalogo-demo.json` fora no corporativo. Depois de `npm run db:exportar-demo`, o
arquivo novo só vai para o corporativo, num commit próprio.

**Conferir se os dois ficaram iguais**, depois do merge na `develop`:

```bash
git fetch origin corporativo
git diff --stat origin/main corporativo/develop
```

Só podem aparecer `.key_cti`, `.gitignore` e `server/seed/catalogo-demo.json`.

Crie `server/.env` a partir de `server/.env.example` apontando para o Supabase:

```env
DATABASE_URL="postgresql://postgres.iezvzcrmzdfljvbbdneu:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.iezvzcrmzdfljvbbdneu:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

Desde o Prisma 7, a aplicação conecta pelo `pg` (adaptador `@prisma/adapter-pg`), e
`server/lib/databaseConnection.ts` traduz a URL. Num host remoto, a conexão é sempre
criptografada, com ou sem `sslmode`. `localhost` fica sem TLS, salvo `sslmode` na URL;
`sslmode=verify-full` também valida o certificado. Os parâmetros `pgbouncer` e
`connection_limit` continuam aceitos: o primeiro é ignorado e o segundo vira o tamanho
do pool. O `migrate` usa o `DIRECT_URL`, lido em `server/prisma.config.ts`.

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

# 3. Faça o backup e envie a pasta data/export-AAAAMMDD-HHMM/ para a pasta restrita
#    do time de ID no Drive corporativo. Depois apague a cópia local:
npm run db:exportar

#    Aplique no banco:
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
estão sem capa. No fim, roda o descarte por prazo e imprime quantos eventos de
auditoria e visualizações individuais apagou. Os mesmos números ficam registrados em `import_events` e aparecem no
painel admin, na aba de histórico, com data, hora e a capa de cada item. A fila de
revisão passa a mostrar os pendentes e os problemas da planilha desta importação.
Para repassar ao NDE, `npm run relatorio:nde` grava em `data/relatorio-nde-AAAAMMDD.xlsx`
uma planilha com a aba "Leia-me" (resumo e instruções) e a aba "Pendências" (uma
linha por item, com o problema, o que fazer, a linha da planilha quando se sabe, o
código, o título, o status e o link). Não tem dado pessoal.

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

### Subir o Acervo em container

Para quem vai analisar ou validar o projeto sem preparar Node na máquina. Só precisa
de Docker (no Windows, com o WSL instalado; ver "Problemas conhecidos").

```bash
cp .env.example .env     # e preencha JWT_SECRET (openssl rand -base64 48)
npm run app:up           # ou: docker compose --profile app up -d --build
```

O site fica em `http://localhost:8080` (ou na porta do `WEB_PORT` do `.env`), com os
mesmos usuários de teste de "Desenvolver localmente". Para derrubar:
`npm run app:down`; para apagar também o banco, `docker compose --profile app down -v`.

**Rede da Arco (Zscaler).** O proxy da empresa inspeciona o HTTPS, e o build da API
falha ao baixar os binários dos módulos nativos (`unable to get local issuer
certificate`). Exporte a CA raiz do Zscaler para `docker/certs/`, uma vez por
máquina, e construa de novo:

```powershell
$c = Get-ChildItem Cert:\LocalMachine\Root | Where-Object Subject -match 'CN=Zscaler Root CA'
"-----BEGIN CERTIFICATE-----`n" + [Convert]::ToBase64String($c.RawData, 'InsertLineBreaks') + "`n-----END CERTIFICATE-----" |
  Set-Content docker/certs/zscaler-root-ca.crt -Encoding ascii
```

Os `.crt` de `docker/certs/` valem só no estágio de build da API e ficam fora do Git.
Fora da rede da empresa, e no CI, a pasta fica vazia e nada muda.

Medido em 2026-11-10, numa máquina da Arco: imagem da API com 979 MB, a do site com
343 MB, build de cerca de 2 minutos e subida do zero em 27 segundos, com a carga de
demonstração.

O que acontece na subida:

1. O Postgres sobe (o mesmo do `npm run db:up`, na porta 5433).
2. A API aplica as migrações e roda o seed: usuários de teste, BNCC e catálogo.
3. O site sobe no nginx, que encaminha `/api` para a API. A API não fica exposta.

**De onde vem o catálogo.** Sem a planilha, o seed carrega a **carga de demonstração**
`server/seed/catalogo-demo.json`, só num banco sem recursos. Ela traz os recursos
visíveis na galeria (ativo, status do link `Funcionando` e link preenchido) e a BNCC.
Não traz usuários, favoritos, visualizações nem auditoria, e os contadores vão
zerados. É o que qualquer pessoa já vê no site ao entrar.

- Gerar de novo, depois de uma importação: `npm run db:exportar-demo` (lê o banco do
  `server/.env`).
- **O arquivo está no `.gitignore` deste repositório, que é público.** Na migração
  para o repositório corporativo (privado), tire a linha do `.gitignore` e versione o
  arquivo, para que quem clonar veja a galeria cheia.
- Sem a carga e sem a planilha, o Acervo sobe com a galeria vazia.

Para importar a planilha no banco do container, rode `npm run import:categorizacao`
na máquina com o `server/.env` apontando para `localhost:5433`, como em "Desenvolver
localmente".

**Fora do container:** a captura de capas (o Chromium do Playwright deixaria a imagem
bem maior). As capas vêm de `public/thumbs`, que já está no Git.

Não é a produção: não há HTTPS, as portas ficam só em `127.0.0.1` e os botões de
acesso rápido continuam na tela de login. No servidor corporativo, o empacotamento
parte destas imagens e segue o padrão que a TI definir.

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
e-mails `@arcoeducacao.com.br` dos times de Interações Digitais (ID) e do NDE. No *SQL
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
  auditoria, favoritos, visualizações do dia, totais diários e usuários (e-mail e
  papel; nunca o hash de senha). Também serve de backup.
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
4. Restaurar contadores, favoritos e histórico a partir do export. Ainda não há
   comando de restauração: ele é escrito quando o destino e o modelo de identidade
   do JumpCloud estiverem definidos (item no `ROADMAP.md`).
5. Subir a API Express com `VITE_BACKEND=ec2`. As imagens de "Subir o Acervo em
   container" são o ponto de partida; o empacotamento final segue o que a TI definir.
6. Manter o Supabase até validar o servidor. Depois, apagar os exports.

### Descartar dados vencidos

```bash
npm run db:descartar
```

Apaga a auditoria com mais de 6 meses e as visualizações individuais de dias
anteriores, no banco do `server/.env`. A importação já faz isso sozinha; o comando
manual serve para quando ficar mais de um mês sem importar. Para mudar o prazo,
edite `server/lib/retentionPolicy.ts`.

### Encerrar o ambiente de testes

Ao fim do MVP, conforme o mapeamento da DPO, os dados de teste são revistos e
apagados:

1. `npm run db:exportar` só se algo precisar ir para o servidor corporativo.
2. No painel do Supabase, apagar o projeto `iezvzcrmzdfljvbbdneu`. Isso remove
   usuários, favoritos, visualizações e auditoria de uma vez.
3. Apagar os exports do Drive que não forem mais necessários.
4. Remover os botões de acesso rápido de `src/components/LoginPage.tsx`.

`[A VALIDAR]` No servidor, o Postgres é local ou um serviço gerenciado: a resposta é
da TI, no chamado do servidor.

### EC2

Removida em 2026-10-20, por decisão do responsável. Imagens Docker, nginx, Caddy e
os scripts `deploy-ec2.sh` e `recover-ec2-http.sh` saíram do repositório. O modo
`VITE_BACKEND=ec2` continua sendo o nome do backend Express, usado na máquina local.

Em 2026-11-06 voltaram duas imagens (API e site), para o time de validação e como
base do servidor corporativo. Não é a volta da EC2: sem Caddy, sem HTTPS, sem
scripts de deploy e sem porta aberta fora da máquina (ver "Subir o Acervo em
container").

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
| Build da imagem da API: `unable to get local issuer certificate` no `npm ci` (`better-sqlite3`, `node-gyp`) | Proxy corporativo (Zscaler) inspecionando o HTTPS dentro do container | Exportar a CA do Zscaler para `docker/certs/` (ver "Subir o Acervo em container") |
| Container: site não abre em `localhost:8080` | `.env` antigo, da época da EC2, com `WEB_PORT=3000` | Abrir na porta do `WEB_PORT`, ou apagar a linha do `.env` (o padrão é 8080, que não colide com o Vite) |
| Docker Desktop: *Virtualization support not detected* ou *Docker Desktop is unable to start* | Recursos "Plataforma de Máquina Virtual" e WSL desligados ou não instalados no Windows, mesmo com virtualização ligada na BIOS (`wsl --status` diz que o WSL não está instalado) | `wsl --install --no-distribution` como administrador e reiniciar; em máquina corporativa, pode exigir a TI. Para só consultar o catálogo, use o modo Supabase, que não precisa de Docker |
| Galeria com menos recursos que o esperado no modo Supabase | Limite de "Max rows" da Data API (1000 por padrão) | `supabaseFetchOdas` pagina a consulta desde 2026-10-19. Se voltar a ocorrer, conferir se alguma consulta nova de listagem deixou de paginar |

---

## Critérios de qualidade

- `npm run test` (Vitest) passa. A cobertura é de utilitários: filtros, ordenação,
  visibilidade do catálogo e normalizações.
- `npm run typecheck` conclui sem erro (`tsconfig.json` da raiz, modo estrito). O
  `npm run build` do Vite não confere tipos; o CI roda os dois.
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

**7 alertas moderados no `exceljs`, aceitos (2026-11-04).** Vêm do `minimatch`, dentro
do `archiver` que o `exceljs` 4.4.0 (a versão mais nova) traz. O `archiver` só é
carregado pelo gravador em fluxo (`stream.xlsx.WorkbookWriter`), que o projeto não usa:
`lib/excel.ts`, `preparar-planilha.ts` e `relatorio-nde.ts` usam `xlsx.readFile` e
`xlsx.writeFile`, que passam pelo `jszip`. Forçar versões novas do `archiver` quebraria
o pacote sem ganho. Rever se o `exceljs` lançar versão nova ou se o projeto passar a
usar o gravador em fluxo. O CI reprova só alerta alto, então segue verde.

**A EC2 saiu do repositório em 2026-10-20.** A instância já estava inacessível e o
responsável decidiu não guardar o caminho. O gatilho do Apps Script continua parado:
apontava para a API daquela instância.

**O modal de vídeo depende de embed.** Desde 2026-10-19 só o audiovisual abre no
`iframe`; ODAs abrem em nova guia porque, embarcados, parte deles cortava o conteúdo
ou não carregava. Em 2026-10-21 os 1064 links de audiovisual da galeria foram
seguidos até o destino final:

| Destino final | Recursos | No modal |
|---|---|---|
| Vimeo (`player.vimeo.com`) | 286 | Abre |
| Arquivos na DigitalOcean (`cdn-livrodigital…`) | 279 | Abre (sem bloqueio de `iframe`) |
| Conquista (`digital.solucaoconquista.com.br`) | 244 | Abre (sem bloqueio de `iframe`) |
| Livro digital SAE (`livrodigital.sae.digital`) | 202 | Abre (sem bloqueio de `iframe`) |
| Playlist do YouTube (`youtube.com/playlist`) | 19 | **Nova guia** desde 2026-10-21: a página manda `X-Frame-Options: SAMEORIGIN`, e o navegador não consegue seguir o redirecionamento do SAE (bloqueio de CORS) para montar o embed. A regra é `opensInsideAcervo` (`src/utils/openResource.ts`): macroformato ou tipo de objeto "Playlist" abre em nova guia |
| Sem resposta em 10 s ou parado em redirecionamento | 34 | `[A VALIDAR]` testar de novo; pode ser lentidão ou link morto |

Os links passam pelos encurtadores do SAE (`url.sae.digital`, `go.sae.digital`,
`apis.sae.digital`), por isso nenhum aparece como Vimeo ou YouTube na planilha. A
lista de códigos está no `ROADMAP.md`, em "Bugs conhecidos".

**Autenticação sem SSO.** Usuários com senha definida manualmente e o botão
JumpCloud sem função. A proteção contra senha vazada do Supabase Auth está
desligada — decisão consciente enquanto não há base real de usuários.

**Acesso admin compartilhado no ambiente de testes.** O botão "Acesso admin
(provisório)" entra com credencial fixa no front, então qualquer pessoa com a URL
vira admin. **Decisão do responsável (2026-10-21):** no MVP o acesso é um login único
de visitante e um de admin, para demonstrar a ideia; não há contas pessoais. Na
migração para a infraestrutura da Arco o botão de admin deixa de existir e o
administrador é criado no banco. Como o admin vê a lista de e-mails em *Usuários e
perfis*, a regra é não criar conta pessoal enquanto o botão existir.

**Este repositório é público no GitHub.** Toda documentação aqui é legível por
qualquer pessoa. A planilha completa, com e-mails e nomes de avaliadores, ficou no
histórico do Git até 2026-10-20. Decisão do responsável: manter o repositório
público até a migração para o GitHub da ArcoTech, que deve levar um **histórico
limpo**, sem esse arquivo.

---

## Débitos estruturais

- **Dois backends dobram o custo de cada mudança de API.** É uma escolha
  deliberada, com prazo indefinido. Enquanto durar, `src/utils/api/` precisa ser
  tratado como fronteira arquitetural, não como pasta utilitária. Na migração para
  o servidor corporativo, a troca fica concentrada ali e em `supabaseApi.ts`;
  componentes importam de `utils/api` e não mudam.
- **Duas identidades de usuário sem ponte.** Favoritos e histórico de visualização
  não migram entre os modos.
- **Sem teste de integração nem end-to-end.** Nenhuma cobertura do fluxo de login,
  da galeria ou da importação.
- **Bundle inicial acima do recomendado** pelo Vite, na casa dos 500 kB. Há lazy
  loading das páginas pesadas, mas o pacote principal ainda é grande.
- **`src/guidelines/Guidelines.md` está em boa parte obsoleto** (conferido em
  2026-10-21). Descreve primária índigo e secundária rosa (hoje são `#012451` e
  `#f05039`), glassmorphism e gradientes, logo BookOpen (hoje `BrandMark`), filtros
  de 1º ao 5º ano e marcas "CQT, SAE, SPE". Continuam válidos: Nunito, a tabela de
  cores de marca, a regra de cor reservada para componente, campo e marca, e WCAG AA.
  O arquivo tem um aviso no topo até ser reescrito.
- **O workflow de ping tem a URL e a chave `anon` embutidas como valor padrão** e
  também dispara em push. Foi feito assim para validar sem depender de secret.
  Funciona, mas o correto é cadastrar `SUPABASE_URL` e `SUPABASE_ANON_KEY` como
  secrets e remover o gatilho de push.
- **Projeto na Vercel com nome herdado** do repositório, resultando numa URL com
  sufixo aleatório em vez de um endereço escolhido.

---

## Pontos a complementar

- ✅ Onde ficam os dados: respondido pelo responsável em 2026-10-20. Hoje a base
  oficial é o Supabase; no futuro, os dados vão para a infraestrutura da Arco.
- ✅ Backup automático no plano Free: não existe. A página de segurança do Supabase
  diz que só bancos de planos pagos têm backup diário (conferido em 2026-10-21).
- `[A VALIDAR]` Se o comitê aceita JumpCloud com MFA no lugar da VPN. É hipótese do
  responsável, não decisão do comitê.
- ✅ Vídeos que recusam `iframe` (conferido em 2026-10-21): 19 playlists do YouTube,
  que passaram a abrir em nova guia. Os demais destinos abrem; 34 links não
  responderam a tempo e ficam para novo teste.
  Detalhe em "Riscos e pontos de atenção".
- ✅ Backup do banco (responsável, 2026-10-21): `npm run db:exportar` antes de cada
  importação e no mínimo uma vez por mês, guardado numa pasta restrita do time de
  Interações Digitais no Drive corporativo. O export tem e-mails de usuários; a
  cópia na máquina do operador é apagada depois de enviada ao Drive.
- ✅ Enforce SSL no painel do Supabase (responsável, 2026-10-21): não será ativado,
  porque o Supabase não é o ambiente oficial. `sslmode=require` fica nos exemplos de
  `server/.env`.
- `[PERGUNTA AO RESPONSÁVEL]` Para a DPO: texto final do aviso de privacidade, canal
  para os direitos do titular e quantos exports do banco manter. A base legal e os
  prazos de auditoria já vieram no mapeamento. Por enquanto, o Acervo aponta para a
  política do Grupo (2026-11-05).
- `[PERGUNTA AO RESPONSÁVEL]` Para a DPO: texto e formato do banner de cookies (só
  informativo ou com escolha), e se o link da política no login e no menu do perfil
  basta.
- `[PERGUNTA AO RESPONSÁVEL]` Para a Segurança: qual é o cofre corporativo e para onde
  enviar a trilha de auditoria.
