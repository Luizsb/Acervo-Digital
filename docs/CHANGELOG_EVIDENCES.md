# 📌 Decisões & Evidências — Acervo Digital

Histórico de decisões e do valor gerado. Entradas novas vão **no topo**, no formato:
`## AAAA-MM-DD · HH:MM — Nome da mudança`.

Os registros anteriores a 3 de setembro de 2026 foram reconstruídos a partir do
histórico do Git e da documentação existente, na criação desta pasta. Por isso não
trazem a seção "Impacto observado" com dado medido: nenhuma métrica foi coletada na
época.

---

## 2026-10-20 · 15:10 — Versão 2.1: EC2 removida e ícone de macroformato único

### Antes

- A versão no GitHub era a 2.0 (`f38da47`), já publicada.
- O repositório guardava a publicação na EC2: `Dockerfile`, `server/Dockerfile`,
  `docker-entrypoint.sh`, nginx, Caddy, `deploy-ec2.sh`, `recover-ec2-http.sh` e o
  Compose com API, front e Caddy. A instância estava inacessível desde agosto.
- O ícone de macroformato estava copiado em `ProjectCard.tsx` e em
  `MacroformatoBadge.tsx`.

### Depois

- **EC2 removida.** O `docker-compose.yml` sobe só o Postgres local. `server/`
  permanece: é a API de desenvolvimento e a importação da planilha. O nome
  `VITE_BACKEND=ec2` continua, como nome histórico do modo Express.
- **Ícone único.** `MacroIcon` é exportado por `MacroformatoBadge.tsx` e o card usa
  esse. Escolhido entre os quatro pontos de reorganização: é o que não rearranja a
  galeria na véspera do lançamento.
- **Versão** `2.1.0` no `package.json`. O rodapé do login lê esse valor.

### Decisão

O responsável pediu para tirar toda a estrutura da EC2. Quando houver servidor
corporativo, o empacotamento é feito de novo. Isso rompe a regra do `.cursorrules`
que mandava preservar os scripts de deploy; a regra foi reescrita para proteger o
`server/` e o Postgres local, que não são a EC2.

### Evidência

- Arquivos de publicação ausentes. `docker compose config --services` lista só
  `postgres`.
- `npm test` e `npm run build` passando, com `2.1.0` no bundle.

### Impacto observado

Quem clonava e rodava `docker compose up --build -d` precisa passar a usar
`npm run setup` e `npm run server:dev`. O site na Vercel não usava essas imagens.

### Próximos passos

1. Os outros três pontos de reorganização (`App.tsx`, páginas grandes e `api.ts`)
   ficam para depois do lançamento.

---

## 2026-10-20 · 14:45 — Relacionados em carrossel

### Antes

A seção "Você pode se interessar também por:" mostrava até 5 relacionados numa grade
de 1 a 5 colunas, que quebrava em várias linhas nas telas menores.

### Depois

- Componente `RelatedCarousel` (`src/components/RelatedCarousel.tsx` e `.css`): uma
  linha com encaixe por cartão (*scroll snap*), de 1 a 5 cartões visíveis conforme a
  largura, setas que aparecem só quando há para onde rolar, arraste com o mouse,
  deslize nativo no toque e rolagem pelo teclado com a linha em foco.
- O clique que encerra um arraste é descartado; o clique normal abre o recurso.
- Limite de relacionados de 5 para 12 (`RELATED_LIMIT`). Trocar de critério ou de
  recurso volta a linha ao início.

### Decisão

Carrossel em vez de "Ver mais", e até 12 itens, por escolha do responsável.

### Evidência

No navegador, ficha `SAE25_EI_G5_BL3_UT3_OA1`, critério BNCC:
- 12 itens na mesma linha, trilha de 1171 px com 4715 px de conteúdo;
- seta de avançar: rolagem de 4 para 1185 px, seta de voltar aparece e o endereço não
  muda;
- arraste simulado por eventos de ponteiro: 397 px de rolagem, sem abrir o card;
- um clique normal abre `SAE25_EI_G4_BL2_UT4_OD1`.

`npm test` (72) e `npm run build` passando.

### Impacto observado

`[A VALIDAR]` Arraste real com mouse e toque num celular, na Vercel.

### Próximos passos

Nenhum.

---

## 2026-10-20 · 14:40 — Auditoria ativa no Supabase e Vite estável durante a importação

### Antes

- O responsável rodou o `rls.sql`, mas a migração `20261020120000_add_audit_events`
  estava pendente (`prisma migrate status`). A tabela não existia, e o gatilho de
  login só gerava aviso.
- O servidor de desenvolvimento caía com `EBUSY` quando a importação gravava
  `data/ultima-importada.xlsx`: o Vite vigiava a pasta `data/`.
- As planilhas baixadas, com todas as abas e dados pessoais, estavam na pasta
  Downloads.

### Depois

- `npm run prisma:migrate` aplicou a migração no Supabase. A migração já liga a RLS e
  retira o acesso de `anon` e `authenticated`.
- `vite.config.ts`: `server.watch.ignored` para `data/` e `server/`. Afeta só o
  desenvolvimento local.
- As duas planilhas da pasta Downloads foram apagadas, a pedido do responsável.
- O 404 da Vercel foi conferido pelo responsável.

### Decisão

Rodar o `rls.sql` de novo não foi necessário: a migração já aplica a RLS e a revogação
na tabela, e o gatilho `auth_user_change_audit` já existia.

### Evidência

- `prisma migrate status`: "Database schema is up to date!".
- Consulta ao banco: `relrowsecurity = true`, nenhuma permissão para `anon` e
  `authenticated`, gatilhos `auth_user_change_audit` e `users_role_change_audit`
  presentes.
- Login de teste: evento `auth.login`, `demo@acervo.local`, origem `supabase`,
  2026-10-20T17:35:40Z.
- `auth.users`: `admin@acervo.local` com `role = admin`; `demo@acervo.local` sem papel.

### Impacto observado

A trilha de auditoria passa a registrar login, mudança de papel e importação no
ambiente de testes.

### Próximos passos

1. Ativar os alertas do Dependabot no GitHub.
2. Conferir a resposta 404 da URL antiga da planilha depois do deploy.

---

## 2026-10-20 · 14:30 — Importação aplicada, selos sem cor repetida e capas soltas removidas

### Antes

- O critério de importação estava no código, mas o banco ainda tinha 2649 ativos, e a
  galeria tinha 2506.
- O SAMR era sempre âmbar e repetia a cor do campo "Espaços, tempos, quantidades…" e
  de História. Os macroformatos repetiam componentes: ODA e Matemática azuis, Vídeo e
  Física vermelhos, Playlist e Química laranja, Ferramenta e Geografia ciano, RA e
  Inglês índigo.
- 14 capas `SAE25_AF61/AF62_ING_...` estavam soltas na raiz de `public/thumbs/`.

### Depois

- **Importação** da planilha recebida em 2026-10-20, preparada com
  `planilha:preparar` (só a aba Recursos Digitais, 3016 linhas, 28 abas e a coluna
  Avaliador descartadas): 2524 processados, 2 novos, 21 alterados, 132 desativados,
  147 não cadastrados, 20 códigos repetidos listados, 0 erros. **2519 ativos**, todos
  na galeria.
- **Selos:** macroformato e SAMR com o selo neutro (`catalog-neutral` e
  `catalog-macro` em `catalogBadges.css`), também no quadro SAMR da ficha e na etiqueta
  de filtro ativo. O item de lista passou a usar `MacroformatoBadge`, com ícone. A cor
  fica para componente, campo de experiência e marca.
- **Capas:** as 14 soltas foram apagadas com `git rm`.

### Decisão

- **Cor só para o que informa**, por decisão do responsável: não há cores para todos
  os valores serem únicos (13 componentes, 5 campos, 10 macroformatos e o SAMR), então
  os tipos secundários ficam neutros e o ícone diferencia.
- **Apagar as capas soltas:** os códigos não estão na planilha nem no banco, e a
  planilha passou a ter os `SAE26_AF71/AF72_ING_...`.

### Evidência

- `diff:planilha` contra a versão de 19/10: 0 novos, 0 alterados, 0 removidos.
- Resumo da importação acima. A simulação previa os mesmos 2524 cadastráveis e 2519
  ativos.
- Galeria local contra o Supabase: "2519 resultados encontrados"; a busca "Tipos de
  Narrador", antes escondida por uma cópia `Não avaliado`, encontra o recurso.
- Selo SAMR no Jogo Tangram: fundo `rgb(255, 255, 255)`, texto `rgb(51, 65, 85)`.
- `npm test` (72) e `npm run build` passando.
- A auditoria da importação **não foi gravada**: `public.audit_events` não existe no
  Supabase (erro P2021, registrado como aviso, como previsto).

### Impacto observado

O catálogo de produção já está com 2519 recursos, porque o banco é compartilhado. Os
selos e a remoção das capas só chegam ao site depois do commit e do deploy.

### Próximos passos

1. Commit e push das mudanças do dia.
2. Aplicar `audit_events` e o `rls.sql` no Supabase.
3. Apagar as planilhas baixadas na pasta Downloads, que têm dados pessoais.

---

## 2026-10-20 · 14:10 — Importação só de recursos funcionais e aviso de códigos repetidos

### Antes

A importação cadastrava toda linha da planilha. O banco tinha 2649 recursos ativos,
2506 na galeria e 143 na fila de revisão: 92 Quebrado, 31 Incorreto, 17 Não avaliado,
1 Acesso restrito, 1 sem status e 1 Funcionando sem link, incluindo as 37 linhas sem
código (`PLANILHA_L…`). Códigos repetidos na planilha passavam em silêncio, e a última
linha vencia.

### Depois

- `isImportableResource` (`server/lib/catalogVisibility.ts`): a linha só é cadastrada
  se entraria na galeria (`isVisibleInCatalog`) e tem código real.
- `import-categorizacao.ts` pula as linhas fora do critério. Elas não entram em
  `seenCodes`, então o que já estava no banco é desativado pela regra existente de
  "saiu da planilha". Nada é apagado. O resumo e a auditoria mostram os não
  cadastrados.
- `findRepeatedCodes` (`server/lib/map-categorizacao.ts`): o resumo da importação lista
  os códigos repetidos com as linhas.
- Vale para os dois backends: a importação roda pelo Prisma nos dois.

### Decisão

- **Só sobe o que é funcional**, por decisão do responsável. A curadoria do que está
  quebrado fica na planilha do NDE. Isso rompe a regra anterior do `SDD` ("todo o resto
  continua no banco e vai para a fila de revisão"), e a quebra foi apresentada e
  aprovada antes da implementação.
- **Desativar em vez de apagar**, para manter favoritos, contadores e a reativação
  automática.
- **Barra final do código:** sem normalizar; a correção é editorial.

### Evidência

- Simulação sobre a planilha de 2026-10-19, a última versionada, recuperada do
  histórico do Git num arquivo temporário já apagado, sem gravar no banco: 2671 linhas
  com dado, **2524 cadastráveis** e 147 fora (79 Quebrado, 37 sem código, 17 Não
  avaliado, 11 Incorreto, 1 Acesso restrito, 1 sem status, 1 Funcionando sem link).
- 20 códigos repetidos encontrados e listados no `ROADMAP.md`. Em 11 deles o recurso
  `Funcionando` estava escondido por uma cópia `Não avaliado` mais abaixo.
- Consulta ao banco: duas colisões pela barra final (`IMP/24/GLA10`, `IMP/61/ILA19`).
- `npm test` (72 testes, com 5 novos de `isImportableResource` e `findRepeatedCodes`)
  e `npx tsc --noEmit` no `server/` passando.

### Impacto observado

Aplicado ao banco em 2026-10-20 · 14:30 (ver a entrada correspondente): 2519 ativos.

### Próximos passos

1. Preparar a planilha em `data/`, rodar `diff:planilha` e `import:categorizacao`.
2. NDE corrigir os 20 códigos repetidos e as barras finais.

---

## 2026-10-20 · 14:00 — Supabase único e servidor corporativo como pendência

### Antes

O `ROADMAP` e o `SDD` tratavam a exclusão do projeto Supabase `adungjmhuibxvgiqrume`
como ação em aberto, e o risco "dois projetos Supabase" seguia listado.

### Depois

- `ROADMAP.md`: exclusão marcada como concluída, removida do backlog e das próximas
  ações; o servidor corporativo segue no backlog como pendente, sem data.
- `SDD.md`: o risco passa a registrar um único projeto em uso, `iezvzcrmzdfljvbbdneu`.

### Decisão

O responsável confirmou que o banco está num Supabase único, em uso. O servidor
corporativo continua pendente e não bloqueia o ambiente de testes.

### Evidência

Confirmação do responsável no chat, em 2026-10-20.

### Impacto observado

Sem impacto no sistema; só documentação.

### Próximos passos

Nenhum.

---

## 2026-10-20 · 13:50 — Selos de marca nas cores oficiais

### Antes

Os selos comparavam a marca com as siglas `SAE`, `CQT` e `SPE`. O banco guarda
"Conquista" por extenso, então a Conquista caía no caso padrão e saía roxa, igual ao
SAE. A lógica estava copiada no card, no item de lista e na ficha, com cores padrão
diferentes em cada um.

### Depois

- `getMarcaColor` (`src/utils/curriculumColors.ts`) guarda a cor oficial de cada
  marca, indexada pelo nome completo: sigla e nome dão a mesma cor.
- Componente `MarcaBadge` (com `MarcaBadge.css`) usado nos três lugares: selo sólido,
  fundo na cor da marca e texto branco. Marca sem cor definida fica cinza.
- Cores: Conquista `#e40657`, SAE `#591d64`, e já prontas para quando entrarem no
  catálogo: Positivo `#e94c26`, COC `#00963c`, Geekie `#fd1747`, SAS `#032066` e Nave
  `#ee377d`.

### Decisão

- **Selo sólido**, escolhido pelo responsável, para a cor ficar fiel à marca.
- **Cor por variável CSS** (`--marca-color`), porque o Tailwind de `src/index.css` é
  congelado e não tem essas cores.

### Evidência

- No navegador, ambiente local: SAE com fundo `rgb(89, 29, 100)` e Conquista com
  `rgb(228, 6, 87)`, texto branco, no card, na lista, na ficha e nos relacionados.
- `npm test` (67 testes, com 4 novos de `getMarcaColor`) e `npm run build` passando.

### Impacto observado

`[A VALIDAR]` Conferir na Vercel depois do deploy.

### Próximos passos

1. Revisar o contraste do texto branco em Geekie, Positivo e Nave quando essas marcas
   entrarem no catálogo.

---

## 2026-10-20 · 13:45 — Filtro de Marca entre os principais e Conquista deduzida pelo código

### Antes

- O filtro de Marca era o 7º item do grupo "Detalhes", no fim da barra lateral, e só
  aparecia depois de rolar.
- 293 linhas da planilha com código `IMP/...` têm a coluna Marca em branco. A capa já
  ia para `conquista/` pela regra do prefixo, mas o filtro, o selo do card e a busca
  não tratavam esses recursos como Conquista.

### Depois

- Marca é o primeiro item do grupo **Localização**, e a etiqueta do filtro ativo
  aparece primeiro no cabeçalho.
- `brandFromCode` (`src/utils/thumbPaths.ts` e o espelho `server/lib/thumbPaths.ts`)
  expõe a regra do prefixo, que antes só devolvia a pasta. `thumbBrandFolder` passa a
  usá-la, com o mesmo resultado.
- `apiODAToFrontend` (`src/utils/api.ts`) usa a marca da planilha e, se ela estiver em
  branco, a marca deduzida do código. Vale para os dois backends.

### Decisão

- **Marca entre os filtros principais**, a pedido do responsável: é o recorte mais
  amplo do catálogo.
- **Deduzir a marca pelo código**, por decisão do responsável. Com o filtro em
  destaque, a ausência dos recursos sem marca ficaria mais visível. A dedução fica na
  interface; o banco continua com o valor da planilha, para que a correção editorial
  continue aparecendo como pendência.

### Evidência

- No ambiente local, com o filtro Conquista marcado: **518** resultados antes e
  **805** depois, sobre o mesmo banco.
- Opções do filtro de Marca: "Conquista" e "SAE Digital".
- Ordem da barra lateral conferida no navegador: Localização → Marca, Volume,
  Bloco/Capítulo, Livro, Coleção, Envio à escola.
- `npm test` (63 testes, com os novos de `brandFromCode` e do espelho do servidor),
  `npm run build` e `npx tsc --noEmit` no `server/` passando. O `tsc` do servidor
  exigiu `npx prisma generate` antes: o cliente local não tinha `auditEvent`.

### Impacto observado

`[A VALIDAR]` Conferir na Vercel, depois do deploy, o filtro Conquista com o mesmo
número do ambiente local.

### Próximos passos

1. NDE preencher a coluna Marca nas 296 linhas em branco. Três delas não têm prefixo
   conhecido e seguem fora do filtro.

---

## 2026-10-20 · 11:00 — Migração das capas concluída e versão 2.0

### Antes

O banco e o histórico do admin apontavam para os caminhos antigos das capas. As duas
estruturas de pastas conviviam em `public/thumbs/`. O rodapé do login mostrava `v1.1`
escrito direto no código, e o `package.json` dizia `0.1.0`.

### Depois

- **Banco:** `import:categorizacao:com-capa` contra o Supabase deixou 2649 recursos
  ativos, todos com `imagem` em `/thumbs/{marca}/...`. Antes eram 1602 ativos.
- **Histórico do admin:** 741 eventos de `import_events` passaram para os caminhos
  novos.
- **Estrutura antiga removida:** 2519 cópias, mais 4 capas antigas de recursos
  `Quebrado` que o responsável já tinha apagado nas pastas novas. A pasta `IMP/` deixou
  de existir. Restam `sae/` (1714), `conquista/` (804) e as 14 capas `SAE25_..._ING_...`
  que saíram da planilha.
- **Script temporário removido:** `thumbs:organizar`.
- **Versão:** `package.json` em `2.0.0`, injetada pelo Vite como `__APP_VERSION__`.
  O login mostra `v2.0`.

### Decisão

- **Versão:** o rodapé lê a versão do `package.json`, para não haver dois lugares a
  atualizar.
- **Ordem da migração:** publicar, importar, atualizar o histórico e só então apagar.
  Nenhum card ficou sem capa.

### Evidência

- Consulta ao Supabase depois da importação: `{"ativo | novo": 2649}`. Última
  importação registrada às 10:35.
- Log do histórico: "Histórico de importação atualizado: 741 eventos".
- Log da remoção: "Removidas: 2519".
- `npm test` (53), `npm run build` e `npx tsc --noEmit` passando; `"2.0.0"` presente no
  bundle.
- A tabela `audit_events` não existe no Supabase. A importação registrou o aviso e
  seguiu.

### Impacto observado

Galeria e admin com as capas nos caminhos novos. `[A VALIDAR]` Conferir no site uma
capa SAE, uma Conquista e o histórico do admin depois do deploy deste commit.

### Próximos passos

1. Aplicar a migração `audit_events` no Supabase.
2. Decidir o destino das 14 capas órfãs.

---

## 2026-10-20 · 11:15 — Migração das capas concluída, versão 2.0, falha de JWT e página 404

### Antes

- O banco e o histórico do admin ainda apontavam para o caminho antigo das capas.
- O rodapé do login mostrava `v1.1`, escrito à mão, e o `package.json` dizia `0.1.0`.
- Ao recarregar a página, o catálogo às vezes falhava com 401 "JWT issued at
  future". O aviso exibido era de desenvolvimento ("rode `npm run server:dev`").
- Rota interna desconhecida caía no login sem avisar. Link de recurso inexistente
  era ignorado. Endereço inexistente mostrava a 404 genérica da Vercel.

### Depois

- **Migração das capas concluída:**
  - importação no Supabase: 2649 recursos ativos, todos com caminho novo;
  - histórico do admin: 741 eventos atualizados;
  - estrutura antiga removida: 2519 cópias e a pasta `IMP/`;
  - script `thumbs:organizar` removido.
- **Versão 2.0:** `package.json` em `2.0.0`, injetada pelo Vite como
  `__APP_VERSION__`. O login mostra `v2.0`.
- **Erro de JWT:**
  - o cliente do Supabase repete a chamada depois de 1 s e de 2 s quando recebe
    esse 401 (`jwtRetryFetch.ts`);
  - o aviso novo, `CatalogLoadError`, tem botão "Tentar novamente";
  - as instruções de desenvolvimento só aparecem no modo Express.
- **Página 404:**
  - `NotFoundPage` para rota interna desconhecida e para link de recurso inexistente;
  - `public/404.html` para endereço inexistente fora do hash.

### Decisão

- A nova tentativa fica no `fetch` do cliente do Supabase, e não em cada consulta:
  assim vale para todas as chamadas.
- A 404 do link de recurso só aparece depois que o catálogo carregou. Antes disso
  não dá para saber se o código existe.

### Evidência

- Consulta ao Supabase depois da importação: `{"ativo | novo": 2649}`.
- `--atualizar-historico`: "Histórico de importação atualizado: 741 eventos".
- `--remover-antigas`: "Removidas: 2519". Antes, foram apagadas à mão as cópias
  antigas de 4 recursos `Quebrado` cujas capas o responsável tinha removido das
  pastas novas.
- `npm test`: 61 testes, com os novos `jwtRetryFetch.test.ts`,
  `catalogLoadError.test.ts` e os casos `notFound` de `hashRouting.test.ts`.
- `npm run build` passando, com `dist/404.html` gerado e `"2.0.0"` no código final.
- A tabela `audit_events` não existe no Supabase, então a importação rodou sem gravar
  auditoria (ver `ROADMAP.md`).

### Impacto observado

`[A VALIDAR]` Depois do deploy:

- ver se o erro de JWT some ao recarregar a página várias vezes;
- ver se a Vercel serve o `404.html` em `/xyz`;
- conferir capas SAE e Conquista na galeria.

### Próximos passos

1. Validar os três pontos acima em produção.
2. Decidir a configuração do Dependabot (ver `ROADMAP.md`).
3. Aplicar a migração `audit_events` no Supabase.

---

## 2026-10-20 · 10:25 — Recaptura das capas ruins

### Antes

O responsável revisou as capas nas pastas novas e apagou as que estavam com captura
errada.

### Depois

`npm run thumbs:capture` refez 88 capas em cerca de 15 minutos, quase todas
`SAE26_..._VA1` e `SAE26_..._OA1`. Falharam os 4 códigos de Inglês de sempre.

### Decisão

A recaptura usa as mesmas esperas de sempre. Três capas continuam ruins por motivo
que a captura não resolve:

- `SAE25_EI_G4_BL4_UT7_OA1`: o link redireciona para a página inicial do SAE Digital.
- `IMP/94/CLA11` e `IMP/EM03/LLA29`: a página é um player de vídeo, e a captura pega
  o quadro preto antes de tocar.

### Evidência

- Log: "Captura concluída: 88 ok, 0 pulados, 4 falhas, 0 sem link".
- Conferência visual por amostragem:
  - `SAE26_AF72_CIE_C04_VA1` e `SAE26_AF72_ING_C07_OA1` corretas; o vídeo é vertical
    e aparece com faixas brancas nas laterais;
  - as três acima, ruins.

### Impacto observado

`[A VALIDAR]` Só depois do deploy.

### Próximos passos

1. Corrigir o link de `SAE25_EI_G4_BL4_UT7_OA1` na planilha.
2. Avaliar captura de vídeo que dê play ou use o pôster do vídeo, para páginas com
   player.
3. Seguir a publicação: commit e push, importação, `--atualizar-historico`,
   `--remover-antigas`.

---

## 2026-10-20 · 10:00 — Revisão dos scripts npm

### Antes

- Captura pela linha de comando:
  - `thumbs:capture` lia do banco;
  - `thumbs:capture:planilha` lia da planilha, que inclui os recursos adiados pela
    importação.
- `db:down` e `docker:down` rodavam o mesmo `docker compose down`.
- `prisma:migrate` fazia `migrate deploy` na raiz e `migrate dev` no `server/`: mesmo
  nome, efeitos diferentes.
- `server/scripts/map-categorizacao.ts` era biblioteca, usada pela rota do admin e
  por quatro scripts, mas ficava junto dos scripts.

### Depois

- `npm run thumbs:capture` lê da planilha. `-- --do-banco` mantém o comportamento
  antigo. O botão do admin e a captura depois da sincronização continuam lendo do
  banco.
- Saem `thumbs:capture:planilha` e `db:down`. Para parar o Postgres, use
  `docker:down`.
- `prisma:migrate` no `server/` vira `prisma:migrate:dev`. Na raiz, `prisma:migrate`
  continua aplicando as migrações e passa a chamar `prisma:migrate:deploy`.
- `map-categorizacao.ts` foi para `server/lib/` com `git mv`.

### Decisão

O nome `prisma:migrate` foi mantido na raiz porque é citado no README, no SDD, no
`rls.sql` e na mensagem de erro do `App.tsx`, sempre como "aplicar migrações". Os
demais scripts de `server/scripts/` têm função própria e ficam. `organize-thumbs` sai
depois da migração das capas.

### Evidência

- `npx tsc --noEmit` no `server/` passando.
- `npm test`: 53 testes passando.
- `npm run thumbs:capture -- --limit=1`: "Origem da lista: planilha em data/" e
  "Thumbs a capturar: 1". A execução foi interrompida em seguida.
- Nenhuma referência aos nomes antigos em Dockerfile, compose, scripts de deploy ou
  CI. O `docker-entrypoint.sh` chama `prisma migrate deploy` direto.

### Impacto observado

Um comando a menos para lembrar na captura. `[A VALIDAR]` Não há métrica.

### Próximos passos

Remover `organize-thumbs` depois do `--remover-antigas`.

---

## 2026-10-20 · 09:45 — Capas organizadas por pasta de marca

### Antes

As capas ficavam soltas em `public/thumbs/{codigo}.webp`. Os códigos da Conquista
(`IMP/63/ALA19`) viravam subpastas `IMP/63/`, e os 148 que terminam em `/` geravam um
arquivo chamado só `.webp`. A regra do caminho estava repetida em sete pontos: captura,
importação, mapeamento da planilha, `diff:planilha`, auditoria de capas do admin e
dois pontos do front.

### Depois

- **Estrutura nova:** `public/thumbs/{marca}/{arquivo}.webp`, com pastas `sae/` e
  `conquista/`. Marca nova ganha pasta sozinha.
- **Nome do arquivo:** é o código com a barra trocada por `_`, então `IMP/63/ALA19/`
  vira `conquista/IMP_63_ALA19.webp`.
- **Regra centralizada:** `server/lib/thumbPaths.ts`, com espelho em
  `src/utils/thumbPaths.ts`, e `thumbFilePath` em `acervoPaths.ts`. Os sete pontos
  passam a usá-la.
- **Script novo `npm run thumbs:organizar`:** simula por padrão e tem as opções
  `--aplicar`, `--atualizar-historico` e `--remover-antigas`.
- **Capas copiadas:** 2522 para as pastas novas. A estrutura antiga continua no lugar
  até o banco apontar para os caminhos novos.

### Decisão

- **Pastas em minúsculas:** o Windows não diferencia caixa e a Vercel diferencia,
  então "Conquista" e "conquista" na planilha virariam uma pasta aqui e duas no deploy.
- **Código `IMP/...` com a marca em branco vai para `conquista/`:** decisão do
  responsável. São 293 linhas.
- **O código no banco não muda, só o caminho da capa.** Isso substitui a decisão
  anterior de publicar os arquivos `.webp` sem nome, que deixaram de existir.
- **Migração em três passos:** copiar, importar e só então apagar. Assim nenhum card
  fica sem capa entre o deploy e a importação. Copiar não aumenta o repositório,
  porque o Git guarda conteúdo idêntico uma vez só.
- **Histórico do admin:** `import_events` também é atualizado
  (`--atualizar-historico`), por decisão do responsável, para as miniaturas antigas
  continuarem aparecendo.
- **Códigos que dividem capa geram aviso, não bloqueio:** os dois pares encontrados
  são o mesmo recurso repetido na planilha.

### Evidência

- `npm test`: 53 testes passando, 9 deles novos em `src/utils/thumbPaths.test.ts`,
  incluindo "Conquista", "conquista" e "CONQUISTA" caindo na mesma pasta.
  Um desses testes compara o front com o servidor.
- `npx tsc --noEmit` no `server/` e `npm run build` passando. Antes, foi preciso rodar
  `npx prisma generate`: o cliente local estava sem o model `AuditEvent`.
- Simulação do `thumbs:organizar`:
  - 2651 códigos na planilha;
  - 2522 capas a copiar;
  - 128 códigos sem capa;
  - 15 arquivos não referenciados: 14 capas `SAE25_..._ING_...` e `.gitkeep`;
  - 2 capas compartilhadas: `IMP/24/GLA10` com `IMP/24/GLA10/` e `IMP/61/ILA19` com
    `IMP/61/ILA19/`, as duas linhas com mesmo título e mesmo link.
- `--aplicar`: "Copiadas: 2522". Resultado: `sae/` com 1718 arquivos e `conquista/`
  com 804.

### Impacto observado

`[A VALIDAR]` Ainda não publicado. Depois do deploy e da importação, conferir na
galeria uma capa SAE e uma Conquista, inclusive um código terminado em `/`.

### Próximos passos

1. O responsável apaga as capas ruins nas pastas novas e roda
   `npm run thumbs:capture:planilha`.
2. Commit e push, com as duas estruturas juntas, e esperar o deploy.
3. Rodar `npm run import:categorizacao:com-capa` e
   `npm run thumbs:organizar -- --atualizar-historico` contra o Supabase.
4. Rodar `npm run thumbs:organizar -- --remover-antigas`, depois commit e push.

---

## 2026-10-20 · 09:15 — Captura das capas restantes da planilha nova

### Antes

Cerca de 1050 recursos visíveis da planilha nova estavam sem capa e por isso foram
adiados pela importação `--somente-com-capa`. Na véspera, 254 capas foram
capturadas e ficaram sem commit. No início desta rodada, faltavam 757.

### Depois

`npm run thumbs:capture:planilha`, sem limite, capturou 753 capas. Quatro códigos
continuam sem capa, todos presos na tela de carregamento após 3 tentativas:
`EF21_9_ING_L2_U4_01_od2`, `EF22_9_ING_L4_U7_01_OD1`, `EF21_8_ING_L3_U6_01_OD1` e
`EF21_8_ING_L4_U7_02_OD1`. As capas ainda não foram publicadas.

### Decisão

A captura rodou inteira, sem lotes de 100, porque o script pula o que já existe e
pode ser interrompida e retomada sem perda. Nenhum código foi alterado.

Todos os 753 itens capturados têm código `IMP/...`, que vira subpasta em
`public/thumbs/`. Isso foi mantido porque captura, importação e front montam o mesmo
caminho `/thumbs/{codigo}.webp`. Os 151 códigos que terminam em `/` ou em
`index_.html` vieram assim da planilha e foram registrados como bug conhecido em
`ROADMAP.md`, sem correção nesta rodada.

### Evidência

- Log da execução: "Captura concluída: 753 ok, 0 pulados, 4 falhas, 0 sem link",
  em cerca de 1h31 (de 07:42 às 09:13).
- `public/thumbs/IMP/` com 805 arquivos, sendo 149 chamados `.webp`.
- Conferência visual por amostragem de `IMP/61/ALA3`, `IMP/63/ALA19/` e
  `IMP/43/MLA10`: as três mostram o recurso, não a tela de carregamento.

### Impacto observado

Ritmo de cerca de 8 capas por minuto, o dobro da primeira rodada (400 por hora).
`[A VALIDAR]` A galeria só cresce depois do push das capas e da importação
`--somente-com-capa`; medir o total antes e depois.

### Próximos passos

1. Publicar as capas (commit e push, feito pelo responsável) e esperar o deploy da
   Vercel. Decisão do responsável: os códigos `IMP/...` vão como estão.
2. Rodar `npm run import:categorizacao:com-capa` contra o Supabase.
3. Abrir na galeria um recurso cujo código termina em `/` (ex.: `IMP/63/ALA19/`) e
   conferir se a capa aparece. Se não aparecer, corrigir os códigos na planilha.
4. Investigar os 4 códigos de Inglês que não geram capa.

---

## 2026-10-20 · 08:55 — Resposta ao relatório de segurança: validações, auditoria, privacidade e migração

### Antes

- O CI só rodava testes e build. Não havia SAST, SCA nem análise de IaC. A API tinha 8
  vulnerabilidades conhecidas nas dependências: 1 crítica, 3 altas e 4 moderadas.
- Não existia trilha de auditoria de login, mudança de papel ou alteração de dados.
- Não havia matriz de permissões, inventário de dados pessoais nem aviso de
  privacidade.
- Não havia caminho documentado para migrar para outro servidor.

### Depois

- **SCA:** `npm audit --omit=dev --audit-level=high` no CI, no front e na API
  (reprova o build), e Dependabot semanal para npm e GitHub Actions.
- **SAST e IaC:** `.github/workflows/seguranca.yml` com CodeQL (`security-extended`)
  e Trivy em modo de configuração, a cada push e toda segunda-feira, com o resultado
  enviado à aba *Code scanning*. A Trivy Action está fixada por SHA.
- **Dependências da API:** `npm audit fix`, chegando a 0 vulnerabilidades.
- **Trilha de auditoria:** tabela `audit_events` (migração `20261020120000`), com RLS
  e sem acesso pela Data API.
  - O Express registra login, falha de login com motivo e IP, importação (inclusive
    pela linha de comando) e criação, edição e exclusão de recurso.
  - Um gatilho na tabela `users` registra mudança de papel.
  - Em `rls.sql`, o gatilho `audit_auth_user_change` registra login e mudança de
    papel no Supabase.
- **`SDD.md`, seção nova "Segurança e privacidade":** matriz de permissões, consulta
  de relatório de usuários, trilha de auditoria e suas limitações, inventário de
  dados pessoais com retenção proposta, rascunho do aviso de privacidade, MFA como
  risco aceito, cofre pendente e tabela de validações automáticas.
- **Migração:** `npm run db:exportar` e runbook "Migrar para o servidor corporativo".
- **Graphify** instalado como ferramenta local (`uv tool`), com `.graphifyignore`,
  `graphify-out/` fora do Git e a regra do Cursor local.

### Decisão

- O MFA fica como risco aceito no ambiente de testes e chega com o JumpCloud.
- O aviso de privacidade terá texto próprio, a aprovar pela DPO.
- O cofre de senhas depende de resposta da Segurança.
- Auditoria no próprio Postgres, e não em serviço externo, para migrar junto com o
  banco e funcionar nos dois backends. A falha de auditoria não bloqueia a operação
  auditada.
- A trilha não tem política de leitura para admin: com o botão de admin
  compartilhado, qualquer visitante a leria.

### Evidência

- `npm audit` da API: 8 vulnerabilidades → 0.
- PGlite, com Postgres real em WebAssembly e o esquema `auth` simulado: 18
  verificações passaram.
  - As 9 migrações em ordem.
  - Mudança de papel gera um evento; repetir o mesmo papel não gera.
  - `audit_events` com RLS e sem grants.
  - `rls.sql` aplicado duas vezes sem erro.
  - Login e mudança de papel em `auth.users` registrados; `user_metadata` não gera
    evento.
  - `is_acervo_admin()` ignora `user_metadata`.
  - Login funciona com a auditoria indisponível.
- `prisma validate` ok e `tsc --noEmit` da API sem erro, com o cliente Prisma novo
  gerado à parte (a captura de capas em andamento travava o cliente padrão).
- `npm test`: 44 testes passando.
- Graphify: grafo só de código com 753 nós, 1704 relações e 42 grupos, com
  `GRAPH_REPORT.md` gerado.

### Impacto observado

`[A VALIDAR]` Depois do primeiro push, conferir os achados de CodeQL e Trivy na aba
*Security* e decidir quais tratar. Depois de aplicar a migração no Supabase, conferir
os primeiros eventos em `audit_events`.

### Próximos passos

Estão no `ROADMAP.md`, seção "Resposta ao relatório do Comitê Security by Design":
aplicar a migração e o `rls.sql`, ativar os alertas do Dependabot, levar o
inventário à DPO e perguntar à Segurança sobre o cofre e o destino da auditoria.

---

## 2026-10-20 · 08:40 — Planilha preparada só com o necessário e rumo pós-relatório de segurança

### Antes

A planilha baixada do Drive ia inteira para `data/`: 29 abas, 8,2 MB, logs do Apps
Script com e-mails de quem a operou e a coluna "Avaliador" com nomes de pessoas.
Nenhum desses dados é usado pelo Acervo. A estrutura da aba (nome, cabeçalho, início
dos dados) estava repetida em três scripts. Os documentos tratavam a Vercel como
produção e a planilha como origem genérica.

### Depois

- `npm run planilha:preparar -- "arquivo-baixado.xlsx"`
  (`server/scripts/preparar-planilha.ts`) grava em `data/` só a aba `Recursos
  Digitais`, só valores, sem as colunas de `PERSONAL_DATA_COLUMNS` e sem os metadados
  do arquivo original.
- `server/lib/planilhaLayout.ts` centraliza a estrutura da aba e a lista de colunas
  pessoais. Importação, `diff:planilha` e captura de capas usam esse módulo.
- `diff:planilha` e `planilha:preparar` resolvem caminho relativo a partir da pasta
  onde o `npm` foi chamado.
- `SOBRE.md`, `SDD.md` e `ROADMAP.md` registram as decisões abaixo, e o runbook ganhou
  "Promover ou rebaixar administrador".

### Decisão

Decisões do responsável depois do relatório do Comitê Security by Design:

- A Vercel com o Supabase é ambiente de testes.
- O destino é um servidor corporativo com JumpCloud; a VPN pode ser dispensada se o
  comitê aceitar.
- O repositório continua público até o GitHub da ArcoTech, com migração de histórico
  limpo.
- A planilha oficial é do NDE, no Drive.
- O admin é concedido pelo banco, sem tela, para não criar fluxo de dados pessoais
  na interface.

Contatos de TI e de Gestão de Acessos ficam fora do repositório, que é público.

### Evidência

- `npm run planilha:preparar` sobre a planilha atual: 1 aba mantida, 28 descartadas,
  coluna "Avaliador" removida, 8,2 MB → 1,3 MB.
- O arquivo resultante tem só a aba `Recursos Digitais`, nenhuma célula com e-mail e
  o criador "Acervo Digital".
- `npm run diff:planilha` do arquivo preparado contra a planilha completa: 2651 linhas
  úteis nos dois, 0 novos, 0 alterados, 0 removidos. A preparação não muda nada do
  que o importador lê.
- `cd server && npx tsc --noEmit` sem erro.

### Impacto observado

`[A VALIDAR]` Na próxima atualização real do catálogo, confirmar que o fluxo download
→ preparar → diff → importar funciona para quem opera.

### Próximos passos

Os itens abertos estão no `ROADMAP.md`, seção "Resposta ao relatório do Comitê
Security by Design".

---

## 2026-10-20 · 07:50 — Contenção de segurança: planilha fora do site e papel admin só pelo servidor

### Antes

A planilha de categorização ficava em `public/` e era versionada no Git. Tudo em
`public/` é publicado pela Vercel como arquivo estático, então a planilha inteira podia
ser baixada pela URL do site sem login, inclusive os recursos que não entram na
galeria. As abas de log do Apps Script trazem e-mails de quem operou a planilha, o que
é dado pessoal.

No modo Supabase, o papel de administrador era aceito tanto de `app_metadata` quanto de
`user_metadata`, em `is_acervo_admin()` e em `roleFromUser`. O `user_metadata` é
editável pelo próprio usuário.

### Depois

- A planilha mora em `data/`, fora de `public/` e ignorada pelo Git (`/data/` e
  `public/**/*.xlsx` no `.gitignore`). `ACERVO_DATA_DIR` permite outro diretório.
- `server/lib/acervoPaths.ts` centraliza os caminhos de planilha, capas e metodologia.
  Importação, captura de capas, `diff:planilha` e as rotas de upload do Express usam
  esse módulo.
- O `diff:planilha` compara com `data/ultima-importada.xlsx`, gravada ao fim de cada
  importação sem erros, em vez de ler a versão do Git.
- O seed (`npm run setup` e Docker) pula o catálogo com aviso quando a planilha não
  está em `data/`, em vez de derrubar o container.
- `docker-compose.yml` monta `./data:/app/data` na API.
- `vite.config.ts` deixou de tratar `.xlsx` como asset.
- Papel de administrador lido só de `app_metadata`, no SQL e no front.

### Decisão

Contenção aprovada pelo responsável depois da leitura do relatório do Comitê Security
by Design. O código continua no repositório pessoal e a hospedagem continua em Vercel
e Supabase Free durante o MVP, porque ainda não há acesso ao GitHub da Arco nem
destino de hospedagem definido.

### Evidência

- `npm test`: 8 arquivos, 44 testes passando, incluindo `src/utils/supabaseApi.test.ts`
  (papel em `user_metadata` é ignorado).
- `npm run build` sem erro e nenhum `.xlsx` em `dist/`.
- `cd server && npx tsc --noEmit` sem erro.
- `npm run diff:planilha` lendo a planilha de `data/` e a base `ultima-importada.xlsx`.

### Impacto observado

`[A VALIDAR]` Depois do deploy, confirmar que a URL antiga da planilha no domínio da
Vercel responde 404.

### Próximos passos

1. Aplicar `scripts/supabase/rls.sql` no *SQL Editor* do Supabase. Antes, confirmar que
   os administradores reais têm `role: admin` em `app_metadata`.
2. Fazer o deploy e conferir o 404 da planilha.
3. A planilha continua no histórico do Git. Decidir entre tornar o repositório privado
   ou reescrever o histórico.
4. Alinhar com o responsável o restante do plano de resposta ao relatório.

---

## 2026-10-19 · 16:25 — ODAs abrem em nova guia

### Antes

"Explorar recurso em tela ampliada" abria o ODA num `iframe` dentro de um modal
16:9. Jogos com outra proporção apareciam cortados, e parte dos ODAs ficava presa em
"carregando objeto digital 0%" quando embarcada (relato do responsável com captura de
tela, recurso `EI23_5A_L4_U1_01_OD2`).

### Depois

Para ODA e demais recursos não audiovisuais, o botão virou o link "Abrir recurso em
nova guia" (`target="_blank"`, `rel="noopener noreferrer"`). Vídeo continua no modal
"Assistir em tela ampliada". A abertura continua contando no ranking como `open`.

### Decisão

Revisão da decisão da coordenação de manter o recurso dentro do Acervo, tomada pelo
responsável: o `iframe` não oferece controle sobre a proporção nem sobre a
inicialização do ODA. Foi usado um link de verdade, não `window.open`, para não
esbarrar em bloqueador de pop-up e permitir clique do meio. Vídeo ficou no modal
porque o embed do Vimeo funciona bem.

### Evidência

- `src/components/ProjectDetailsPage.tsx`: link de nova guia para não audiovisual;
  modal restrito ao audiovisual. `ProjectDetailsPage.css` sem a variante `is-oda`.
- Navegador, ficha `SAE25_EI_G5_BL3_UT3_OA2`: link com destino correto e
  `target="_blank"`; botão de tela ampliada ausente; o clique chamou
  `record_oda_view` com `p_kind: "open"`.
- `npm test` e `npm run build` passando.

### Impacto observado

`[A VALIDAR]` Confirmar com quem usa se os jogos deixaram de aparecer cortados e se
o ranking de aberturas mantém o volume.

### Próximos passos

Nenhum.

---

## 2026-10-19 · 16:20 — Primeira importação por fases em produção

### Antes

Supabase com 1194 recursos e 997 visíveis na galeria, da planilha anterior.

### Depois

`npm run import:categorizacao:com-capa` contra o Supabase: 408 novos, 305
alterados, nenhum desativado, nenhum erro, 1065 adiados por falta de capa. Galeria
de 997 para **1459** recursos, conferida no banco e no front. Dos visíveis, só
`EF21_9_ING_L2_U4_01_od2` e `EF22_9_ING_L4_U7_01_OD1` estão sem capa — já estavam
antes.

### Decisão

As capas foram publicadas na Vercel antes da importação, e a presença delas foi
conferida por HTTP, para nenhum card novo nascer sem imagem.

### Evidência

- Saída do script na primeira execução (números acima).
- Segunda execução: 0 novos, 28 alterados, 1054 adiados.
- Contagem no banco com `catalogVisibleWhere`: 1459 visíveis, 2 sem arquivo de capa.
- Galeria do usuário comum: "1459 resultados encontrados", capas carregando.

### Impacto observado

A segunda execução não foi totalmente estável: 28 alterados e 11 adiados a menos.
Causa: 20 códigos repetidos na planilha, com linhas que se sobrescrevem a cada
importação (ver `ROADMAP.md`, bugs conhecidos). Comportamento anterior à opção nova;
a galeria não foi afetada.

### Próximos passos

1. Corrigir os códigos repetidos na planilha.
2. Seguir capturando capas em lotes e repetindo a importação.

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
