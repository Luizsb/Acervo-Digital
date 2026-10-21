# 🗺️ Roadmap — Acervo Digital

Este arquivo é a fonte da verdade do planejamento. Canvases locais do Cursor são
rascunhos de trabalho e não substituem o que está aqui.

---

## Status geral

**MVP em ambiente de testes**, na Vercel com banco e autenticação no Supabase Free.
O destino é um servidor corporativo da Arco com SSO JumpCloud. O Lançamento 1 está
entregue. O projeto entra em setembro de 2026 num período de
**transferência de responsabilidade**, com o mantenedor original em férias.

A prioridade neste momento não é funcionalidade nova: é garantir que a operação do
catálogo continue sem depender de uma pessoa específica.

## Fase atual

**Fase 5 — Continuidade da operação.** Documentar, transferir acessos e reduzir a
dependência de ambiente local para atualizar o catálogo.

---

## Roadmap por fases

### Fase 1 — Lançamento 1 ✅ Concluída

- Catálogo único de ODAs e audiovisual a partir da planilha de categorização
- Login local e galeria autenticada
- Filtros de localização editorial: coleção, livro, bloco/capítulo, envio à escola,
  volume
- Filtros de currículo: segmento, ano/série, componente, BNCC
- Ficha do recurso, requisitos técnicos normalizados e recomendações relacionadas
- Painel admin com fila de revisão
- Sincronização da planilha criando, atualizando e desativando pelo código do recurso
- Execução local e na EC2 com Docker

### Fase 2 — Automação e qualidade do dado ✅ Concluída

- Rotina agendada no Apps Script enviando a planilha para o webhook da API
- Painel admin exibindo data e origem da última sincronização
- Captura automatizada de capas em WebP
- Fila de revisão agrupada por motivo, inclusive linhas incompletas da planilha

### Fase 3 — Infraestrutura na EC2 ✅ Concluída e removida em 2026-10-20

- HTTPS automático com Caddy, certificado emitido direto no IP
- Deploy automático por GitHub Actions via SSH
- Script de recuperação de emergência em HTTP

O acesso à instância foi perdido. Todo esse caminho continua no repositório.

### Fase 4 — Migração para Vercel + Supabase ✅ Concluída

Resposta à perda de acesso à EC2, com custo zero.

- Modo `VITE_BACKEND=supabase` no front, com Auth e Data API
- RLS aplicada em todas as tabelas, funções `SECURITY DEFINER` restritas ao papel
  `authenticated`
- Ping semanal no GitHub Actions para o plano Free não pausar
- Histórico de importação persistido em `import_events` e exibido no painel admin
  com capas, data e hora
- Ordenação do catálogo pelos recursos mais visualizados
- Deploy da EC2 desativado no CI. Em 2026-10-20 as imagens, o nginx, o Caddy e os
  scripts de deploy saíram do repositório, por decisão do responsável. O `server/`
  e o Postgres local ficam

### Fase 5 — Continuidade da operação 🔄 Em andamento

- ✅ Estruturar a documentação no padrão D.N.E.E. Docs
- ✅ Definir o destino do projeto Supabase duplicado: manter o ativo
  (`iezvzcrmzdfljvbbdneu`) e excluir o antigo, que está sem uso
- ✅ Decidir sobre a senha do banco: **não será rotacionada.** O risco foi avaliado e
  aceito pelo responsável
- 🔄 Repassar acessos por mensagem direta: Supabase, Vercel, GitHub e a senha do banco
- ✅ Supabase único: o projeto `adungjmhuibxvgiqrume` saiu de uso e só o
  `iezvzcrmzdfljvbbdneu` está ativo (confirmado pelo responsável em 2026-10-20)
- ✅ Etiqueta "Admin" no botão de perfil para identificar o acesso administrador
- ✅ Importação por fases (`import:categorizacao:com-capa`) e planilha nova versionada
- ✅ Corrigir o limite de 1000 linhas do catálogo no modo Supabase (paginação em
  `supabaseFetchOdas`)
- ✅ Captura de capas a partir da planilha (hoje o padrão de `thumbs:capture`)
- ✅ Importar a planilha nova no Supabase só com os recursos que já têm capa (galeria
  de 997 para 1459 recursos)
- ✅ ODAs abrem em nova guia; só o audiovisual continua no modal
- ✅ Capturar as capas restantes da planilha nova: 753 capturadas em 20/10, só 4
  códigos ficaram sem capa
- ✅ Capas organizadas por marca (`public/thumbs/sae/`, `conquista/`...), com a regra
  do caminho centralizada em `thumbPaths.ts`. Migração concluída em 20/10: banco,
  histórico do admin e arquivos nos caminhos novos; estrutura antiga removida
- ✅ Revisão dos scripts: `thumbs:capture` lê da planilha por padrão (sai o
  `thumbs:capture:planilha`), sai o `db:down` duplicado, `prisma:migrate` do
  `server/` vira `prisma:migrate:dev` e `map-categorizacao` vai para `server/lib/`
- ✅ Recapturar as capas que saíram ruins: 88 refeitas em 20/10
- ⬜ Corrigir na planilha o link de `SAE25_EI_G4_BL4_UT7_OA1`, que cai na página
  inicial do SAE Digital
- ⬜ Captura de páginas com player de vídeo (`IMP/94/CLA11`, `IMP/EM03/LLA29`): hoje
  sai o quadro preto; avaliar dar play ou usar o pôster do vídeo
- ✅ Publicar as capas, importar no Supabase (2649 recursos ativos, todos no caminho
  novo), atualizar o histórico do admin (741 eventos) e remover a estrutura antiga
- ✅ Remover o script temporário `thumbs:organizar`
- ✅ Versão 2.0: lida do `package.json` e exibida no rodapé do login
- ✅ Nova tentativa automática para o 401 "JWT issued at future" e aviso de falha do
  catálogo com "Tentar novamente", sem instruções de desenvolvimento em produção
- ✅ Falha de banco no ambiente de testes explica o erro e pede contato com o time
  de Interações Digitais, inclusive quando o plano gratuito pausa o projeto
- ✅ `api.ts` dividido em `src/utils/api/` (auth, favorites, catalog, admin, types,
  http, odaToProject), sem mudar o que os componentes importam
- ✅ Admin: status da planilha voltou a carregar na aba principal (a condição de
  aba estava no efeito errado)
- ✅ Reorganização do `App.tsx` (1046 → 520 linhas): hooks `useCatalog` e
  `useFavorites`; componentes `MobileActiveFilters`, `WelcomeBanner`,
  `ContentTypeSelector` e `GalleryResults`. A navegação por hash ficou no `App.tsx`
- ⬜ Reorganização: `AdminReviewPage.tsx` e `ProjectDetailsPage.tsx`
- ✅ Checagem de tipos do front: `tsconfig.json` em modo estrito, `npm run typecheck`
  no CI, zero erros
- ⬜ Tipos gerados das tabelas do Supabase (`supabase gen types`), para o
  TypeScript conferir nomes de coluna em `supabaseApi.ts`
- ✅ Página 404: rota interna desconhecida, link de recurso inexistente e endereço
  inexistente na Vercel (`public/404.html`)
- ✅ Vercel serve o `404.html` em endereço inexistente (conferido pelo responsável em
  2026-10-20)
- ⬜ Dependabot: agrupar atualizações menores num PR por semana, tratar as versões
  maiores à mão e desligar o deploy de pré-visualização da Vercel nas branches
  `dependabot/*`. Hoje há 12 PRs abertos, um deploy cada; o do vitest 5 falha por
  conflito com `@types/node` 20
- ⬜ Investigar `EF21_9_ING_L2_U4_01_od2`, `EF22_9_ING_L4_U7_01_OD1`,
  `EF21_8_ING_L3_U6_01_OD1` e `EF21_8_ING_L4_U7_02_OD1`, presos na tela de
  carregamento na captura
- ✅ 14 capas `SAE25_AF61/AF62_ING_...` soltas na raiz de `public/thumbs/` apagadas:
  os códigos não existem na planilha nem no banco (a planilha passou a ter os
  `SAE26_AF71/AF72_ING_...`). Ficam no histórico do Git
- ✅ Versão 2.1: EC2 removida do repositório e ícone de macroformato num lugar só
- ✅ Relacionados da ficha em carrossel de uma linha (`RelatedCarousel`): até 12
  recursos, setas, arraste com o mouse, deslize no toque e rolagem pelo teclado; o
  arraste não abre o card
- ✅ Selos sem cor repetida: macroformato e SAMR passam ao selo neutro; cor só para
  componente, campo de experiência e marca
- ✅ Filtro de Marca promovido a primeiro item do grupo Localização; recurso `IMP/...`
  sem marca na planilha passa a contar como Conquista no filtro, no selo e na busca
  (Conquista na galeria: de 518 para 805)
- ✅ Importação só de recursos funcionais (`Funcionando`, link e código real); o resto
  fica na planilha e o que já estava no banco é desativado. A importação lista os
  códigos repetidos
- ✅ Importação com o critério novo, em 2026-10-20, sobre a planilha recebida nesse dia
  (conteúdo igual ao da versão de 19/10 no `diff:planilha`): 2519 recursos ativos, 132
  desativados, 147 linhas não cadastradas, 20 códigos repetidos listados, 0 erros.
  Galeria de 2506 para 2519
- ✅ Selos de marca nas cores oficiais (Conquista, SAE, e já prontas Positivo, COC,
  Geekie, SAS e Nave), num componente único `MarcaBadge`. Conquista deixou de sair
  roxa como o SAE
- ⬜ Contraste do texto branco nos selos de marca, medido em 2026-10-21 (mínimo AA
  para texto pequeno: 4,5:1). Passam SAE (11,77), SAS (14,97) e Conquista (4,71).
  Ficam abaixo Positivo (3,80), Nave (3,83), COC (3,87) e Geekie (3,90). Hoje só SAE
  e Conquista estão no catálogo; decidir o tratamento quando as outras entrarem

### Resposta ao relatório do Comitê Security by Design 🔄 Em andamento

Relatório recebido com risco geral **alto**, avaliado quando o Acervo ainda era uma
ferramenta de cadastro.

**Decisões do responsável (2026-10-20):**

- A Vercel com o Supabase é o **ambiente de testes** do MVP.
- O destino é um **servidor corporativo da Arco** com **SSO JumpCloud**. A
  integração é feita quando o servidor existir. O pedido de servidor segue o caminho
  TI → Requisição → Infraestrutura → Configuração em servidores; o contato de
  JumpCloud está com o responsável.
- Com JumpCloud e MFA, a hipótese é dispensar a VPN. `[A VALIDAR]` Depende de aceite
  formal do comitê.
- O repositório continua público até haver um repositório no GitHub da ArcoTech.
  Tudo deve estar pronto para a migração, que leva histórico limpo.
- A planilha oficial é do **NDE, no Drive da empresa**. Ela não é lida
  automaticamente porque a TI bloqueia; entra por download manual e passa pelo
  `planilha:preparar`. O banco é o local oficial dos dados.
- Gestão de administradores **pelo banco**, sem tela, restrita a e-mails
  `@arcoeducacao.com.br` dos times de Interações Digitais e Acervo.
- O acesso à planilha no Drive, inclusive de terceiros, é responsabilidade do NDE, que
  já conhece o apontamento da Gestão de Acessos.

**Itens:**

- ✅ Contenção: planilha fora de `public/` e do Git; papel de administrador lido só de
  `app_metadata`
- ✅ `npm run planilha:preparar`: só a aba Recursos Digitais, só valores, sem a coluna
  Avaliador
- ✅ Procedimento de promover e rebaixar admin documentado no runbook do `SDD.md`
- ✅ SAST, SCA e IaC: CodeQL, `npm audit` no CI, Dependabot e Trivy. Vulnerabilidades
  da API zeradas (eram 1 crítica, 3 altas e 4 moderadas)
- ✅ Trilha de auditoria `audit_events` nos dois backends: login, falha de login
  (Express), mudança de papel, importação e alteração de recurso
- ✅ Matriz de permissões e consulta de relatório de usuários e perfis (`SDD.md`)
- ✅ Inventário de dados pessoais, retenção proposta e rascunho do aviso de
  privacidade, para a DPO (`SDD.md`)
- ✅ `npm run db:exportar` e runbook de migração para o servidor corporativo
- ✅ Graphify como ferramenta local de mapa do código
- ✅ MFA: risco aceito no ambiente de testes; vem com o JumpCloud
- ✅ Aplicado no Supabase em 2026-10-20: `rls.sql` (pelo responsável, no SQL Editor) e
  a migração `audit_events` (`npm run prisma:migrate`). RLS ligada, nenhuma permissão
  para `anon` e `authenticated`, gatilho de login gravando (`auth.login` de
  `demo@acervo.local` às 14:35). `admin@acervo.local` com `role = admin` em
  `app_metadata`. A importação das 14:26 rodou antes da tabela e não tem evento
- ⬜ Deploy e conferência de que a URL antiga da planilha responde 404
- ⬜ Ativar no GitHub *Dependabot alerts* (*Settings → Advanced Security → Dependabot
  alerts → Enable*) e conferir a aba *Security → Code scanning* depois do push
- ⬜ Levar à DPO: inventário, base legal, prazos de retenção, aviso e canal do titular
- ⬜ Exibir o aviso de privacidade na tela de login, depois da aprovação da DPO
- ⬜ Rotina de descarte (visualizações e auditoria), depois da aprovação dos prazos
- ⬜ Perguntar à Segurança qual é o cofre corporativo e para onde enviar a auditoria
- ⬜ Comando de restauração a partir do export, quando o destino estiver definido
- ⬜ Abrir o chamado do servidor corporativo
- ⬜ Solicitar o repositório no GitHub da ArcoTech e migrar com histórico limpo
- ⬜ Integrar o JumpCloud no backend Express e remover os botões de acesso rápido
- ⬜ Pedir ao comitê o aceite de JumpCloud com MFA no lugar da VPN e enviar a
  atualização de escopo (cadastro → vitrine de consulta). Texto de resposta redigido
  em 2026-10-21, fora do repositório; falta revisar e enviar no PSBD-411
- ✅ Relatório de usuários e perfis no admin (aba *Usuários e perfis*, com CSV), nos
  dois backends; o SQL continua no runbook. Função `admin_list_users()` aplicada no
  Supabase em 2026-10-21
- ✅ Evidência de criptografia em repouso e em trânsito no `SDD.md` (Supabase AES-256
  e TLS; Vercel só HTTPS)
- ✅ *Enforce SSL* no Supabase: não será ativado (responsável, 2026-10-21), porque o
  Supabase não é o ambiente oficial. No servidor da Arco o SSL do banco é exigido
- ✅ Backup definido (responsável, 2026-10-21): `db:exportar` antes de cada importação
  e no mínimo mensal, na pasta restrita do time de ID no Drive corporativo
- ✅ `npm run relatorio:nde`: planilha de pendências para o NDE (Leia-me + Pendências).
  Primeira versão gerada em 2026-10-21 com 172 itens
- ⬜ Enviar ao NDE a planilha de pendências e combinar o prazo da próxima versão da
  planilha
- ✅ As 19 playlists do YouTube abrem em nova guia (ver "Bugs conhecidos")
- ✅ Tour do primeiro acesso completo: 7 passos curtos (ficha, favoritos e menu do
  perfil em passos próprios) e nunca na tela de login
- ⬜ Opcional: tocar playlist dentro do Acervo, resolvendo o destino do link na
  importação e guardando o endereço de embed
- ✅ Fila do admin com "Sem código" e "Código repetido" (tabela `import_issues`,
  recriada a cada importação), com a linha da planilha e qual linha vale
- ✅ Resposta ao comitê explica a função do login de admin do MVP (demonstração,
  conta de teste, só leitura)
- ✅ Selos de marca e macroformato com o mesmo tamanho dos vizinhos, na grade e na
  lista
- ✅ Fluxos do `SDD.md` revisados contra o código, com mapa geral e ciclo de
  correção com o NDE
- ✅ Decisão (2026-10-21): no MVP, login único de visitante e de admin, só para
  demonstrar a ideia. Na migração, o botão de admin sai e o admin é criado no banco.
  Nenhuma conta pessoal enquanto o botão existir

### Fase 6 — Reduzir a dependência de máquina local ⬜ Planejada

O objetivo é que atualizar o catálogo deixe de exigir um ambiente Node configurado.
Nenhuma das alternativas foi avaliada tecnicamente ainda. Sem data (responsável,
2026-10-21): depende do servidor da Arco.

- Retomar o gatilho automático de sincronização, apontando para um destino que
  exista (Supabase Edge Function, ou a API no servidor corporativo)
- Captura de capas sob demanda a partir do painel admin, o que exige um host com
  Node e Playwright
- Alternativa de curto prazo: registrar o procedimento em vídeo e garantir que duas
  pessoas saibam executá-lo

### Fase 7 — Identidade e acesso ⬜ Planejada

- SSO JumpCloud no lugar do login com senha, implementado no backend Express para o
  servidor corporativo
- Definir papéis além de `admin`, se necessário. Hoje o admin é concedido pelo
  banco
- Reativar a proteção contra senha vazada no Supabase Auth quando houver base real
  de usuários

---

## Backlog priorizado

| Prioridade | Item | Por quê |
|---|---|---|
| 1 | Repassar acessos por mensagem direta a quem assume | Sem isso o catálogo congela |
| 2 | Abrir o chamado do servidor corporativo e solicitar o GitHub da ArcoTech | Pendente, sem data. Destrava o JumpCloud e a maior parte do relatório de segurança |
| 3 | Cadastrar os secrets do workflow de ping e remover o gatilho de push | Hoje funciona com valor embutido |
| 4 | Corrigir os 20 códigos repetidos na planilha (lista em "Bugs conhecidos") | Vence a linha da galeria, senão a última; um deles junta dois recursos diferentes |
| 5 | SSO JumpCloud | Tira o login com senha manual |
| 6 | Teste end-to-end do fluxo de login e galeria | Única forma de detectar quebra dos dois backends |
| 7 | Reduzir o bundle inicial | Aviso do Vite, sem impacto relatado por usuário |
| 8 | Reescrever `src/guidelines/Guidelines.md` | Confirmado em 2026-10-21: descreve cores, logo e filtros de uma versão anterior; tem aviso no topo |

---

## Bugs conhecidos

- ✅ **19 vídeos em playlist do YouTube não tocavam no modal** (conferido em
  2026-10-21). O encurtador do SAE leva a `youtube.com/playlist`, que recusa `iframe`,
  e o navegador não consegue seguir o redirecionamento para montar o embed (o SAE
  bloqueia por CORS). Desde 2026-10-21 a playlist abre em nova guia
  (`opensInsideAcervo`). Tocar dentro do Acervo exigiria resolver o destino na
  importação e guardar o endereço de embed (`youtube.com/embed/videoseries?list=…`).
  Códigos: `EF22_9_L1_ING_1ED`, `EF22_9_L1_ING_2ED`,
  `EF22_9_L1_ING_3ED`, `EF22_9_L1_ING_4ED`, `EF22_9_L1_MAT_4_ED`, `EF22_9_L2_ING_1ED`,
  `EF22_9_L2_ING_2ED`, `EF22_9_MAT_L1_U1_03_ED`, `EF229L1CIE2ED`, `EF229L1CIE3ED`,
  `EF229L1HIS3ED`, `EF229L1HIS4ED`, `EF229L1HIS5ED`, `EF229L1MAT5ED`, `EF229L1POR1ED`,
  `EF229L1POR2ED`, `EF229L1POR3ED`, `EF229L2ING3ED`, `EF229L2ING4ED`.
- **34 links de audiovisual sem destino em 10 segundos** (2026-10-21)
  `[A VALIDAR]`: testar de novo antes de levar ao NDE. Entre eles `IMP/84/CLA44/`,
  `IMP/84/CLA59/`, `IMP/92/MLA71`, `IMP/G21/ELA13`, `IMP/G22/ELA47`, quatro
  `EF21_…_OD2`/`od2` parados em `apis.sae.digital` e 25 códigos `SAE23`–`SAE26`
  (`…_VA1`, `…_OA1`), como `SAE25_AF61_FIL_C01_VA1` e `SAE26_AI44_GEO_C11_VA1`.
- **Códigos repetidos na planilha.** 20 códigos aparecem em duas linhas cada (planilha
  de 2026-10-19). Desde 2026-10-20 a importação lista todos no resumo. Correção
  editorial: manter uma linha por código. Na planilha:
  - **Funcionando seguido de uma cópia `Não avaliado`** (o título é o próprio código):
    11 códigos, linhas 1951–1961 contra 2027–2039: `EF21_8_POR_L1_U1_02_OD1`,
    `_U1_02_OD2`, `_U2_01_OD1`, `_U2_01_OD2`, `_U2_02_OD1`, `_U2_02_OD2`, `_U2_03_OD1`,
    `_U2_03_OD2` e `EF21_8_CIE_L1_U1_01_OD1`, `_U1_02_OD1`, `_U1_03_OD1`. A cópia
    vencia e escondia o recurso; com o critério de importação, ele volta à galeria.
  - **Dois recursos diferentes com o mesmo código:** `EF21_8_ART_L1_U1_02_OD1`, linhas
    1979 ("Walt Disney, o Midas dos desenhos") e 1980 ("Noções de desenho do rosto de
    personagens"). Só um entra; o outro precisa de código próprio.
  - **Linha duplicada idêntica ou quase:** `EF21_8_HIS_L1_U1_02_OD1` (1933/2041),
    `EF21_8_HIS_L1_U2_01_OD1` (1936/2044), `IMP/23/GLA3` (2522/2657) e `IMP/33/GLA3`
    (2524/2659), todos `Funcionando`; `EF21_8_HIS_L1_U1_03_OD1`, `_U1_04_OD1` e
    `_U2_02_OD1` (1934–1937/2042–2045), todos `Quebrado`.
  - **`Incorreto` seguido de `Funcionando`:** `EF21_5_EDF_L2_U1_02_od1` (1656/1657).
- **Códigos que só diferem pela barra final, no banco.** `IMP/24/GLA10` e
  `IMP/24/GLA10/` estão os dois `Funcionando`: o card "Jogo do trânsito" aparece duas
  vezes na galeria. `IMP/61/ILA19/` é `Incorreto` e sai com o critério de importação.
  Decisão do responsável: correção editorial, sem normalizar o código na importação.
- **Códigos `IMP/...` com cara de caminho na planilha.** Os códigos da Conquista vêm
  como `IMP/63/ALA19`; 148 terminam em `/` e 3 em `index_.html`. A capa já não
  depende disso: o nome do arquivo troca a barra por `_` (`IMP_63_ALA19.webp`). Fica o
  dado inconsistente na planilha, inclusive duas linhas repetidas do mesmo recurso
  que só diferem pela barra final: `IMP/24/GLA10` e `IMP/24/GLA10/`, `IMP/61/ILA19` e
  `IMP/61/ILA19/`. Elas dividem a capa. Correção editorial: um código por recurso,
  sem barra no fim.
- **Marca em branco na planilha.** 296 linhas estão sem Marca, 293 delas com código
  `IMP/...`. No banco são 291 recursos ativos sem marca (conferido em 2026-10-21):
  as 293 linhas menos as cópias de `IMP/23/GLA3` e `IMP/33/GLA3`, que se repetem.
  Desde 2026-10-20, a interface deduz Conquista pelo prefixo, como já fazia a capa.
  As 3 restantes são linhas **sem código do recurso** e aparecem na fila do admin,
  em "Sem código": `PLANILHA_L2274` (sem título nem link), `PLANILHA_L2314`
  (Estrutura interna do osso) e `PLANILHA_L2316` (Circulação do corpo humano). As
  duas últimas apontam para PDFs de realidade aumentada na pasta `SPE` do SharePoint
  `[HIPÓTESE — CONFIRMAR]` Sistema Positivo; quem confirma é o NDE. Correção
  editorial: preencher a coluna e dar código a essas linhas, ou removê-las.
- ✅ **`ERR_NAME_NOT_RESOLVED` no domínio do Supabase dentro da rede corporativa**
  (setembro de 2026, DNS da rede). Encerrado pelo responsável em 2026-10-21: o
  projeto sai do Supabase na migração, então não será levado à TI.
- **Favoritos não migram entre os modos de backend.** Não é bug de código, é
  consequência da arquitetura, mas se comporta como bug para o usuário que testou
  nos dois ambientes.

---

## Débitos técnicos

Estão descritos com detalhe em `docs/SDD.md`, seção "Débitos estruturais". Em
resumo: dois backends em paralelo, duas identidades de usuário sem ponte,
documentação de infraestrutura dividida entre `README.md` e `SDD.md`, ausência de
teste de integração, bundle inicial grande, e o workflow de ping com configuração
embutida.

---

## Melhorias sugeridas

Ideias sem compromisso de execução, registradas para não se perderem:

- Backup periódico do banco além do que o plano Free oferece.
- Tela de métricas de uso, aproveitando os dados já coletados em
  `oda_view_events` e `auth_view_events`.
- Sinalizar automaticamente na fila de revisão o recurso cujo link passou a
  responder erro, transformando a curadoria em algo reativo em vez de manual.
- Endereço próprio na Vercel, em vez da URL com sufixo herdado do repositório.

---

## Em observação

### Abertura do recurso

A pedido da coordenação, a experiência era explorar o recurso dentro do Acervo em
vez de compartilhar o link: "Copiar Link" virou "Copiar código" e "Abrir em outra
janela" virou um modal em tela ampliada, para audiovisual e ODA.

**Desde 2026-10-19, só o audiovisual continua no modal.** ODAs e demais recursos
abrem em nova guia (`src/components/ProjectDetailsPage.tsx`), por decisão do
responsável: dentro do `iframe` 16:9, jogos com outra proporção ficavam cortados e
parte dos ODAs travava em "carregando objeto digital 0%".

Pontos a acompanhar:

- O endereço do ODA passa a ficar visível na barra da nova guia. Se a coordenação
  ainda quiser esconder o link, a alternativa precisa resolver o corte e o
  carregamento — o `iframe` não resolveu.
- Vídeos seguem no `iframe`; Vimeo e YouTube aceitam embed.

---

## Próximas ações

Na ordem, para quem assume o projeto:

1. Ler `docs/SDD.md`, seção **Rotina de operação**.
2. Preparar a máquina conforme o runbook. A senha do banco e os acessos aos painéis
   são repassados por mensagem direta, nunca pelo repositório.
3. Executar um ciclo completo de atualização do catálogo, mesmo sem planilha nova,
   usando `npm run diff:planilha` para confirmar que o ambiente responde.
4. Conferir na aba Actions do GitHub se o workflow de ping continua ativo.

## Pontos a complementar

- ✅ Datas das fases 6 e 7 (responsável, 2026-10-21): sem data. Dependem do servidor
  da Arco; até lá, manutenção sob demanda.
- ✅ Demanda editorial em espera fora deste arquivo (responsável, 2026-10-21): não há.
- ✅ Recuperação da EC2 abandonada em 2026-10-20. O destino é o servidor corporativo.
- ✅ Onde ficam os dados (responsável, 2026-10-20): hoje a base oficial é o
  Supabase; no futuro, a infraestrutura da Arco.
