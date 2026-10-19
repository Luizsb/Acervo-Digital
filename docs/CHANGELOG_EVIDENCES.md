# 📌 Decisões & Evidências — Acervo Digital

Histórico de decisões e do valor gerado. Entradas novas vão **no topo**, no formato:
`## AAAA-MM-DD · HH:MM — Nome da mudança`.

Os registros anteriores a 3 de setembro de 2026 foram reconstruídos a partir do
histórico do Git e da documentação existente, na criação desta pasta. Por isso não
trazem a seção "Impacto observado" com dado medido: nenhuma métrica foi coletada na
época.

---

## 2026-10-19 · 16:10 — Captura de capas a partir da planilha

### Antes

`npm run thumbs:capture` monta a lista a partir do banco. Com a importação por fases,
os recursos adiados por falta de capa não estão no banco, então a captura nunca os
encontrava — e eles nunca ganhavam capa para poder entrar.

### Depois

`npm run thumbs:capture:planilha -- --limit=100` (atalho para `--da-planilha`) lê a
lista da planilha em `public/` com o mesmo critério do banco: status `Funcionando`,
link preenchido e código real, sem repetir código. O log informa a origem da lista.
A captura padrão continua lendo do banco, inclusive no botão do admin.

### Decisão

A leitura da planilha reaproveita `loadRows` e `findWorkbook` da importação, agora
exportados, em vez de duplicar o parser. O script da raiz termina em `--` para que
`--limit` e as demais opções cheguem ao script do `server/`.

### Evidência

- `server/scripts/capture-thumbs.ts`: opção `fromSheet` / `--da-planilha`.
- Execução real com `--limit=2`: "Origem da lista: planilha em public/", dois
  recursos processados.
- `npm test`, `npm run build` e `npx tsc --noEmit` passando.

### Impacto observado

`[A VALIDAR]` Medir capas por hora nos lotes do dia a dia. Referência da primeira
rodada: cerca de 400 capas em uma hora.

### Próximos passos

Os dois primeiros códigos da lista (`EF21_9_ING_L2_U4_01_od2` e
`EF22_9_ING_L4_U7_01_OD1`) falham sempre e consomem parte de cada lote até serem
corrigidos na planilha.

---

## 2026-10-19 · 16:05 — Paginação do catálogo no modo Supabase

### Antes

`supabaseFetchOdas` pedia `range(0, 2499)`, mas a Data API corta cada resposta no
"Max rows" do projeto, 1000 por padrão. Medido no navegador: o admin recebia
`content-range 0-999/1194` e a galeria mostrava 803 recursos, contra 997 do usuário
comum. A importação da planilha nova levaria os visíveis acima de 1000 e cortaria a
galeria de todos.

### Depois

A consulta é feita em blocos de 1000, avançando pelo tamanho real de cada resposta
até o total informado (`count: 'exact'`). Recurso repetido entre blocos é descartado
pelo id. A galeria do admin passou a mostrar 997 recursos.

### Decisão

Paginar no cliente em vez de aumentar o "Max rows" no painel: o painel não é
versionado e a correção valeria só até o catálogo crescer de novo. A regra de
visibilidade não mudou. O modo Express não tinha o problema, porque filtra no
servidor e não tem teto de linhas.

### Evidência

- `src/utils/supabaseApi.ts`: `supabaseFetchOdas` com paginação.
- Galeria do admin contra o Supabase: de 803 para 997 resultados.
- `npm test`, `npm run build` e `npx tsc --noEmit` passando.

### Impacto observado

Galeria do admin igual à do usuário comum (997). `[A VALIDAR]` Conferir após a
importação se o total da galeria bate com o número de visíveis informado pelo script.

### Próximos passos

Nenhum específico. Qualquer nova listagem no modo Supabase precisa paginar.

---

## 2026-10-19 · 15:45 — Importação por fases: só entra na galeria o recurso com capa

### Antes

A planilha nova de categorização tem 2508 recursos visíveis, contra 997 na versão
importada. Das capas necessárias, cerca de 1450 não existiam em `public/thumbs/`. A
importação sincroniza a planilha inteira, então rodá-la publicaria mais de mil cards
sem capa. Capturar tudo antes de importar leva várias horas de Playwright.

### Depois

`npm run import:categorizacao:com-capa` (atalho para `--somente-com-capa`) importa a
planilha normalmente, mas **não cria** recurso novo que entraria na galeria sem capa.
Recursos já cadastrados recebem as atualizações da planilha; recursos novos que vão
para a fila de revisão são criados; o resumo informa quantos foram adiados. Sem a
opção, o comportamento é o anterior, inclusive no upload do admin e no Apps Script.

Planilha nova versionada em `public/` e 402 capas novas capturadas.

### Decisão

O filtro fica na **entrada da importação**, não na regra de visibilidade. O banco
guarda só o caminho da capa, sem saber se o arquivo existe, então exigir capa em
`catalogVisibility.ts` obrigaria a criar coluna e manter o dado sincronizado. Filtrar
a planilha à mão também foi descartado: a planilha oficial deixaria de ser a fonte.

A captura foi rodada a partir da lista da planilha nova, sem banco, reutilizando
`captureMissingThumbs`, e interrompida pelo responsável em cerca de 400 capas. O
restante será capturado em lotes no dia a dia.

### Evidência

- `server/scripts/import-categorizacao.ts`: opção `onlyWithThumb` /
  `--somente-com-capa` e campo `deferredWithoutThumb` no resumo.
- Scripts `import:categorizacao:com-capa` na raiz e em `server/`.
- `npm test` (41 testes), `npm run build` e `npx tsc --noEmit` passando.
- Comparação das planilhas sem banco: 1454 códigos novos, 302 alterados, nenhum
  removido, 127 passam a visíveis, 1 sai da galeria (`SAE26_AI33_HIS_C07_OA1`, agora
  `Incorreto`).

### Impacto observado

`[A VALIDAR]` A importação em produção ainda não foi executada: depende da senha do
banco em `server/.env` e da correção do limite de 1000 linhas do Supabase (ver
`ROADMAP.md`, bugs conhecidos). Medir depois: total da galeria antes e depois, e se
uma segunda execução não produz diferença.

### Próximos passos

1. Corrigir a paginação do catálogo no modo Supabase.
2. Rodar `npm run import:categorizacao:com-capa` contra o Supabase.
3. Capturar as capas restantes em lotes e repetir a importação a cada lote.
4. Investigar `EF21_9_ING_L2_U4_01_od2` e `EF22_9_ING_L4_U7_01_OD1`, que ficam presos
   na tela de carregamento e nunca geram capa.

---

## 2026-10-19 · 15:40 — Etiqueta de perfil administrador no cabeçalho

### Antes

Quem entrava pelo acesso admin não tinha sinal visual do perfil. A única diferença
era o item "Painel administrativo" escondido dentro do menu, o que confundia quem
alterna entre os dois acessos.

### Depois

Etiqueta "Admin" sobreposta à borda inferior do botão de perfil, no desktop, no
mobile e na página de favoritos. No menu de perfil, "Administrador" aparece abaixo do
nome. Usuário comum não vê nenhuma etiqueta.

### Decisão

Componente único `RoleBadge` com CSS dedicado (`RoleBadge.css`), porque o
`index.css` é Tailwind congelado e o botão de perfil está repetido em três lugares.
A decisão de mostrar ou não usa `isAdminRole`, a mesma regra que já libera o painel,
e o papel chega igual nos dois backends — sem mudança de API.

### Evidência

- `src/components/RoleBadge.tsx` e `RoleBadge.css`; uso em `Navigation.tsx`,
  `FavoritesPage.tsx` e `ProfileMenu.tsx`.
- Verificado no navegador contra o Supabase: etiqueta presente como admin, ausente
  como demo, em largura mobile e desktop.
- `npm test`, `npm run build` e `npx tsc --noEmit` passando.

### Impacto observado

`[A VALIDAR]` Sem medição. Confirmar com quem usa o acesso admin se a dúvida sobre o
perfil logado deixou de acontecer.

### Próximos passos

Nenhum. Revisitar quando o SSO JumpCloud trouxer papéis além de `admin` (Fase 7).

---

## 2026-09-03 · 11:55 — Decisões da transferência de responsabilidade

### Antes

A estruturação da documentação, registrada logo abaixo, deixou em aberto três itens
da Fase 5: o destino do projeto Supabase duplicado, a rotação da senha do banco e a
confirmação de que quem assume conseguiria rodar o ciclo de atualização do catálogo.

### Depois

Os três itens foram resolvidos pelo responsável e o `ROADMAP.md`, o `SDD.md` e as
pendências deste arquivo foram atualizados. O backlog priorizado passou de dez para
nove itens e a Fase 5 ficou com uma única ação pendente de execução.

O `README.md` ganhou instruções de como abrir a documentação, tanto lendo os
Markdown direto no GitHub quanto servindo a página visual localmente.

### Decisão

**O projeto Supabase antigo será excluído.** `adungjmhuibxvgiqrume` está sem uso;
`iezvzcrmzdfljvbbdneu` continua sendo a produção. Enquanto a exclusão não acontecer,
o `SDD.md` alerta para conferir o identificador antes de mexer em configuração.

**A senha do banco não será rotacionada.** Ela circulou em conversa interna durante
a migração e o risco foi avaliado e aceito. A senha segue tratada como segredo, fora
do repositório, e é repassada por mensagem direta.

**Os acessos são repassados por mensagem direta**, não por documento no
repositório — que é público. Isso vale para a senha do banco e para os painéis do
Supabase, da Vercel e do GitHub.

**Removida a tarefa de confirmar que o novo responsável rodou o ciclo completo.** Ela
foi criada como controle de qualidade da própria documentação, mas o responsável
optou por não mantê-la como item de roadmap. O runbook continua no `SDD.md` como
referência de consulta.

### Evidência

- `docs/ROADMAP.md`: Fase 5 com três itens concluídos e um pendente; backlog
  reordenado; próximas ações ajustadas.
- `docs/SDD.md`: riscos do projeto duplicado e da senha reescritos como decisões, e
  duas pendências de validação encerradas.
- `README.md`: nova seção *Como ler a documentação*.

### Impacto observado

`[A VALIDAR]` Três marcações de dúvida foram encerradas e nenhuma nova foi criada.
Restam quatro pontos a validar no `SDD.md`, todos sem impacto na operação diária.

### Próximos passos

1. Excluir o projeto `adungjmhuibxvgiqrume` no painel do Supabase.
2. Repassar os acessos por mensagem.

---

## 2026-09-03 · 11:40 — Estruturação da documentação no padrão D.N.E.E. Docs

### Antes

O projeto tinha documentação, mas espalhada e parcialmente desatualizada. O
`README.md`, com 379 linhas, descrevia a EC2 como ambiente de produção — o que
deixou de ser verdade em agosto de 2026, quando a produção passou para Vercel +
Supabase. O `ROADMAP.md` na raiz tinha 42 linhas e não registrava débitos técnicos
nem bugs conhecidos. Não havia nenhum documento de visão de produto, nenhum registro
de decisões, e nenhuma rotina de operação escrita: o procedimento para atualizar o
catálogo existia apenas na cabeça do mantenedor e em trechos do `README.md`.

Nenhum dos seis arquivos do padrão D.N.E.E. Docs existia.

### Depois

Criados `.cursorrules` e a pasta `docs/` com `SOBRE.md`, `SDD.md`, `ROADMAP.md`,
`CHANGELOG_EVIDENCES.md` e `visao-projeto.html`.

O `ROADMAP.md` da raiz foi movido para `docs/`, com o conteúdo preservado e
expandido: as fases concluídas ganharam registro explícito, e foram acrescentadas
seções de backlog priorizado, bugs conhecidos, débitos técnicos e próximas ações.

O `SDD.md` recebeu uma seção **Rotina de operação** com o runbook completo: preparar
a máquina, atualizar o catálogo quando a planilha mudar, recapturar capas, conferir
se o site está no ar, manter o Supabase acordado, desenvolver localmente e voltar
para a EC2 — mais uma tabela de sintomas e soluções.

### Decisão

**Manter os dois backends documentados**, com Vercel + Supabase como produção e a
EC2 como plano de retorno, em vez de declarar um deles obsoleto. A recuperação do
acesso à instância ainda é uma possibilidade e apagar esse caminho da documentação
tornaria a volta caríssima.

**Priorizar a rotina de operação** sobre a descrição de arquitetura. O risco
concreto na transferência de responsabilidade não é alguém não entender o código: é
o catálogo parar de ser atualizado porque o procedimento depende de um ambiente
local que ninguém mais tem.

**Marcar as lacunas em vez de preenchê-las.** Foram registradas cinco perguntas ao
responsável e nove pontos a validar, incluindo a rotação da senha do banco e o
destino do projeto Supabase duplicado. Números de volume do catálogo ficaram como
`[A VALIDAR]` em vez de fixados, para não envelhecerem errado.

### Evidência

- Seis arquivos criados, um movido: `.cursorrules`, `docs/SOBRE.md`, `docs/SDD.md`,
  `docs/ROADMAP.md`, `docs/CHANGELOG_EVIDENCES.md`, `docs/visao-projeto.html`, e o
  `ROADMAP.md` da raiz absorvido por `docs/ROADMAP.md`.
- `README.md` atualizado para apontar a produção correta e referenciar `docs/`.
- Verificado no levantamento que o Supabase estava respondendo:
  `GET /rest/v1/keep_alive` retornou `200 [{"id":1}]`. O
  `ERR_NAME_NOT_RESOLVED` observado no dia anterior era DNS da rede corporativa, não
  pausa do projeto — diagnóstico corrigido e registrado no `SDD.md`.

### Impacto observado

`[A VALIDAR]` O impacto só pode ser medido pela execução: quem assume o projeto
deve conseguir rodar o ciclo completo de atualização do catálogo usando apenas o
runbook, sem consultar o mantenedor original. Essa é a validação pendente e está
registrada como ação 3 no `ROADMAP.md`.

### Próximos passos

1. Repassar os acessos e a senha do banco por canal seguro.
2. Acompanhar a primeira atualização de catálogo feita pelo novo responsável.
3. Resolver as pendências marcadas `[PERGUNTA AO RESPONSÁVEL]` nos quatro arquivos.

---

## 2026-08-26 · 09:26 — Fechamento das brechas de segurança do Supabase

### Antes

O Security Advisor do Supabase apontava três problemas: a tabela
`_prisma_migrations` estava sem RLS e acessível, e as funções `is_acervo_admin()` e
`record_oda_view()`, ambas `SECURITY DEFINER`, tinham `EXECUTE` concedido a
`PUBLIC`.

### Depois

RLS habilitada em `_prisma_migrations` com todo o acesso revogado de `anon` e
`authenticated`. Nas duas funções, `EXECUTE` revogado de `PUBLIC` e `anon`, e
concedido apenas ao papel `authenticated`. Tudo em `scripts/supabase/rls.sql`.

### Decisão

Não ativar a proteção contra senha vazada, também sugerida pelo advisor, porque
ainda não há sistema de login com usuários reais. Fica registrado no `ROADMAP.md`
como parte da fase de identidade e acesso.

### Evidência

Alertas correspondentes deixaram de aparecer no Security Advisor.

### Próximos passos

Reativar a proteção contra senha vazada quando o SSO entrar.

---

## 2026-08-18 · 16:06 — Catálogo ordenado pelos recursos mais vistos

### Antes

A galeria era ordenada por `id` decrescente, ou seja, pela ordem de importação da
planilha. Os primeiros cards eram arbitrários e frequentemente os menos
interessantes.

### Depois

Ordenação por `pageViewCount` decrescente, depois `openViewCount` decrescente,
depois `id` decrescente, implementada em `src/utils/galleryLayout.ts` e na consulta
de `server/routes/odas.ts`, com testes unitários.

### Decisão

Usar a visita à ficha como sinal primário e a abertura do recurso como desempate,
em vez de somar os dois. São intenções diferentes e a ficha é o sinal mais
abundante.

### Impacto observado

`[A VALIDAR]` A percepção de que a vitrine ficou mais interessante não foi medida.

---

## 2026-08-18 · 15:58 — Histórico de novos e atualizados no painel admin

### Antes

O resultado de uma importação só existia na saída do terminal. Depois de fechar a
janela, não havia como saber o que tinha entrado, o que mudou nem quais recursos
ficaram sem capa.

### Depois

Nova tabela `import_events` e migração correspondente. O script de importação passa
a registrar cada recurso criado, atualizado, reativado e desativado, com data, hora,
código, título, status e caminho da capa. O painel admin ganhou uma aba de histórico
com sub-abas de novos e atualizados, exibindo a capa de cada item ou a indicação de
que ela falta.

### Decisão

Persistir o histórico no banco em vez de gerar arquivo de log, para que ele apareça
no painel independentemente de quem rodou a importação e de qual máquina.

### Evidência

Aba de histórico do painel admin listando os itens da última sincronização com capa,
data e hora.

---

## 2026-08-18 · 15:43 — Ping semanal para o Supabase Free não pausar

### Antes

O plano Free do Supabase pausa o projeto após 7 dias sem consulta ao banco, o que
tira o site do ar até alguém restaurar manualmente no painel.

### Depois

Workflow `.github/workflows/keep-supabase-awake.yml` consultando a tabela
`keep_alive` toda terça e sexta às 8h de Brasília, com execução manual disponível.

### Decisão

Criar uma tabela dedicada de uma linha em vez de consultar `odas`, para o ping não
depender do catálogo e ficar óbvio o que ele faz. A URL e a chave `anon` ficaram
como valor padrão embutido, para o ping funcionar sem depender de secret configurado
— registrado como débito no `SDD.md`.

### Evidência

Execução verde na aba Actions do GitHub.

### Próximos passos

Cadastrar `SUPABASE_URL` e `SUPABASE_ANON_KEY` como secrets e remover o gatilho de
push.

---

## 2026-08-18 · 15:11 — Modo Supabase no front e migração para a Vercel

### Antes

A aplicação só funcionava contra a API Express. Com a EC2 inacessível, o produto
estava fora do ar e sem caminho de volta.

### Depois

`src/config/backend.ts` passou a selecionar o backend por `VITE_BACKEND`, com
`src/utils/supabaseApi.ts` implementando login, favoritos, catálogo, contagem de
visualizações e painel admin sobre o Supabase Auth e a Data API. Políticas de RLS
em `scripts/supabase/rls.sql`. Front publicado na Vercel.

### Decisão

**Não remover `server/` nem o `docker-compose.yml`.** A migração foi tratada como
alternância de alvo, não como substituição de arquitetura, para que a volta à EC2
custe uma variável de ambiente.

Importação da planilha e captura de capas continuam fora da nuvem: rodam na máquina
do mantenedor contra o Postgres do Supabase, porque a Vercel não oferece host com
Playwright. A função `supabaseLocalJobOnly` recusa essas operações no modo Supabase
com mensagem explícita.

### Evidência

Produto no ar na Vercel, com custo zero, autenticando pelo Supabase.

### Impacto observado

Este é o débito estrutural mais relevante do projeto: toda mudança de API passou a
custar duas implementações.

---

## Decisões relevantes anteriores

Decisões estruturais tomadas antes de agosto de 2026, sem registro datado. Estão
aqui porque explicam o desenho atual e não devem ser revertidas sem discussão.

**A planilha continua sendo a origem do dado editorial.** Categorização é trabalho
humano feito em planilha, com várias pessoas e histórico. Trocar isso por um CRUD na
aplicação seria outro projeto. A planilha virou fonte de importação, não banco de
dados: o front nunca a lê diretamente.

**O código do recurso é a chave de sincronização, e nada é apagado.** Código que sai
da planilha é desativado, não removido; se voltar, é reativado. Isso preserva
favoritos e histórico de visualização.

**As capas ficam no disco e no Git, não no banco.** Mais de mil imagens como `BYTEA`
deixariam o PostgreSQL pesado. O banco guarda o caminho. A contrapartida é que
publicar capa nova exige commit.

**A visibilidade na galeria é regra centralizada.** Só entra recurso ativo, com
status `Funcionando` e link preenchido. Todo o resto vive no banco para a fila de
revisão. A lógica mora nos arquivos `catalogVisibility.ts` para não se espalhar em
condicionais.

**O recurso abre dentro do Acervo, não em outra aba.** Pedido da coordenação. O
efeito colateral conhecido é que ODAs de terceiros podem recusar `iframe`, e não há
fallback.

**HTTPS foi necessário, não cosmético.** Os ODAs usam Service Worker e Cache API,
que só funcionam em contexto seguro. Em HTTP, o carregador do recurso travava em 0%.
Daí o Caddy no `docker-compose.yml` da EC2.

---

## Métricas observadas ou sugeridas

**O que já é coletado:** contagem de visitas à ficha e de aberturas do recurso, por
recurso, deduplicada por usuário e por dia, nas tabelas `oda_view_events` e
`auth_view_events`. Alimenta a ordenação da galeria e o ranking do painel admin.

**O que a importação registra:** recursos criados, atualizados, reativados e
desativados por sincronização, em `import_events`, com data e hora.

**Métricas sugeridas, ainda não implementadas:**

- Proporção do catálogo que está publicável, ou seja, o tamanho da fila de revisão
  em relação ao total. É o indicador mais direto da saúde do acervo.
- Proporção de recursos publicados sem capa.
- Percentual de links que aceitam `iframe`, para dimensionar o risco do
  visualizador.
- Usuários ativos por semana. Hoje não há como saber quantas pessoas realmente usam
  o acervo.

Nenhuma dessas métricas tem meta definida. `[A VALIDAR]` antes de qualquer meta,
é preciso decidir quem acompanha esses números e com que periodicidade.

---

## Pendências de validação

- `[A VALIDAR]` A tentativa de recuperar o acesso à EC2 continua em curso?
- `[A VALIDAR]` Existe backup do banco além do que o plano Free oferece?
- `[A VALIDAR]` Quantos recursos do catálogo recusam `iframe`?
- `[PERGUNTA AO RESPONSÁVEL]` Quem responde pelo produto e quem responde pela
  operação técnica a partir de setembro de 2026?

Encerradas em 3 de setembro de 2026: a rotação da senha do banco (decidido não
rotacionar), o destino do projeto Supabase duplicado (decidido excluir o antigo) e o
canal de repasse dos acessos (mensagem direta).
