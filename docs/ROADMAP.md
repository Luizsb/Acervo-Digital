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

### Fase 3 — Infraestrutura na EC2 ✅ Concluída, hoje inacessível

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
- Deploy da EC2 desativado no CI

### Fase 5 — Continuidade da operação 🔄 Em andamento

- ✅ Estruturar a documentação no padrão D.N.E.E. Docs
- ✅ Definir o destino do projeto Supabase duplicado: manter o ativo
  (`iezvzcrmzdfljvbbdneu`) e excluir o antigo, que está sem uso
- ✅ Decidir sobre a senha do banco: **não será rotacionada.** O risco foi avaliado e
  aceito pelo responsável
- 🔄 Repassar acessos por mensagem direta: Supabase, Vercel, GitHub e a senha do banco
- ⬜ Excluir o projeto Supabase `adungjmhuibxvgiqrume` no painel
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
- ✅ Página 404: rota interna desconhecida, link de recurso inexistente e endereço
  inexistente na Vercel (`public/404.html`)
- ⬜ `[A VALIDAR]` Conferir em produção se a Vercel serve o `404.html` em `/xyz`
- ⬜ Dependabot: agrupar atualizações menores num PR por semana, tratar as versões
  maiores à mão e desligar o deploy de pré-visualização da Vercel nas branches
  `dependabot/*`. Hoje há 12 PRs abertos, um deploy cada; o do vitest 5 falha por
  conflito com `@types/node` 20
- ⬜ Investigar `EF21_9_ING_L2_U4_01_od2`, `EF22_9_ING_L4_U7_01_OD1`,
  `EF21_8_ING_L3_U6_01_OD1` e `EF21_8_ING_L4_U7_02_OD1`, presos na tela de
  carregamento na captura
- ⬜ Decidir o destino das 14 capas `SAE25_..._ING_...` que saíram da planilha e
  continuam soltas em `public/thumbs/`

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
- ⬜ Aplicar no Supabase: `npm run prisma:migrate` (cria `audit_events`) e depois
  `scripts/supabase/rls.sql`, depois de confirmar que a conta do botão admin
  (`admin@acervo.local`) tem o papel em `app_metadata`. Confirmado em 20/10 que a
  tabela não existe no Supabase: a importação daquele dia rodou sem gravar auditoria
- ⬜ Deploy e conferência de que a URL antiga da planilha responde 404
- ⬜ Ativar no GitHub *Dependabot alerts* e conferir a aba *Security → Code scanning*
  depois do primeiro push
- ⬜ Levar à DPO: inventário, base legal, prazos de retenção, aviso e canal do titular
- ⬜ Exibir o aviso de privacidade na tela de login, depois da aprovação da DPO
- ⬜ Rotina de descarte (visualizações e auditoria), depois da aprovação dos prazos
- ⬜ Perguntar à Segurança qual é o cofre corporativo e para onde enviar a auditoria
- ⬜ Comando de restauração a partir do export, quando o destino estiver definido
- ⬜ Abrir o chamado do servidor corporativo
- ⬜ Solicitar o repositório no GitHub da ArcoTech e migrar com histórico limpo
- ⬜ Integrar o JumpCloud no backend Express e remover os botões de acesso rápido
- ⬜ Pedir ao comitê o aceite de JumpCloud com MFA no lugar da VPN e enviar a
  atualização de escopo (cadastro → vitrine de consulta)
### Fase 6 — Reduzir a dependência de máquina local ⬜ Planejada

O objetivo é que atualizar o catálogo deixe de exigir um ambiente Node configurado.
`[A VALIDAR]` nenhuma das alternativas foi avaliada tecnicamente ainda.

- Retomar o gatilho automático de sincronização, apontando para um destino que
  exista (Supabase Edge Function, ou a API na EC2 se ela voltar)
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
| 2 | Abrir o chamado do servidor corporativo e solicitar o GitHub da ArcoTech | Destrava o JumpCloud e a maior parte do relatório de segurança |
| 3 | Excluir o projeto Supabase `adungjmhuibxvgiqrume` | Decidido: elimina a ambiguidade sobre qual é a produção |
| 4 | Cadastrar os secrets do workflow de ping e remover o gatilho de push | Hoje funciona com valor embutido |
| 5 | Corrigir os 20 códigos repetidos na planilha | Hoje a última linha sobrescreve a anterior e a importação nunca estabiliza |
| 6 | SSO JumpCloud | Tira o login com senha manual |
| 7 | Teste end-to-end do fluxo de login e galeria | Única forma de detectar quebra dos dois backends |
| 8 | Reduzir o bundle inicial | Aviso do Vite, sem impacto relatado por usuário |
| 9 | Revisar `src/guidelines/Guidelines.md` | Pode estar descrevendo estilo que não se aplica mais |

---

## Bugs conhecidos

- **Códigos repetidos na planilha.** 20 códigos aparecem em duas linhas cada, às vezes
  com status diferentes (ex.: `EF21_8_POR_L1_U1_02_OD1` como `Funcionando` e
  `Não avaliado`). A última linha vence e cada importação registra cerca de 28
  "alterados" que não mudaram de verdade. Correção editorial: manter uma linha por
  código. Lista completa obtida com `loadRows` + `mapCategorizacaoRow` agrupando por
  código.
- **Códigos `IMP/...` com cara de caminho na planilha.** Os códigos da Conquista vêm
  como `IMP/63/ALA19`; 148 terminam em `/` e 3 em `index_.html`. A capa já não
  depende disso: o nome do arquivo troca a barra por `_` (`IMP_63_ALA19.webp`). Fica o
  dado inconsistente na planilha, inclusive duas linhas repetidas do mesmo recurso
  que só diferem pela barra final: `IMP/24/GLA10` e `IMP/24/GLA10/`, `IMP/61/ILA19` e
  `IMP/61/ILA19/`. Elas dividem a capa. Correção editorial: um código por recurso,
  sem barra no fim.
- **Marca em branco na planilha.** 296 linhas estão sem Marca, 293 delas com código
  `IMP/...`. A capa vai para `conquista/` pela regra do prefixo, mas o filtro de
  marca da galeria não mostra esses recursos como Conquista. Correção editorial:
  preencher a coluna.
- **`ERR_NAME_NOT_RESOLVED` no domínio do Supabase dentro da rede corporativa.**
  Ocorreu em setembro de 2026 e foi diagnosticado inicialmente como pausa do
  projeto; era o DNS da rede. `[HIPÓTESE — CONFIRMAR]` se acontece de forma
  consistente para outros usuários na mesma rede, o impacto é grave e precisa ser
  levado à TI.
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
4. Excluir o projeto Supabase `adungjmhuibxvgiqrume`, já decidido.
5. Conferir na aba Actions do GitHub se o workflow de ping continua ativo.

## Pontos a complementar

- `[PERGUNTA AO RESPONSÁVEL]` Há compromisso de data para alguma das fases 6 ou 7,
  ou o projeto entra em modo de manutenção durante as férias?
- `[PERGUNTA AO RESPONSÁVEL]` Existe demanda editorial em espera que dependa do
  acervo e não esteja neste arquivo?
- `[A VALIDAR]` Se a recuperação do acesso à EC2 ainda é tentativa em curso ou foi
  abandonada em favor do servidor corporativo.
- `[PERGUNTA AO RESPONSÁVEL]` No servidor corporativo, os dados ficam no Postgres de
  lá ou continuam no Supabase?
