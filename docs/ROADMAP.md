# 🗺️ Roadmap — Acervo Digital

Este arquivo é a fonte da verdade do planejamento. Canvases locais do Cursor são
rascunhos de trabalho e não substituem o que está aqui.

---

## Status geral

**Em produção e em uso**, hospedado na Vercel com banco e autenticação no Supabase.
O Lançamento 1 está entregue. O projeto entra em setembro de 2026 num período de
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
- ⬜ Corrigir o limite de 1000 linhas do catálogo no modo Supabase (bloqueia o item
  seguinte)
- ⬜ Importar a planilha nova no Supabase só com os recursos que já têm capa
- 🔄 Capturar as capas restantes em lotes: cerca de 1050 recursos visíveis da
  planilha nova sem capa, repetindo a importação a cada lote
- ⬜ Investigar `EF21_9_ING_L2_U4_01_od2` e `EF22_9_ING_L4_U7_01_OD1`, presos na tela
  de carregamento na captura

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

- SSO JumpCloud no lugar do login com senha
- Definir papéis além de `admin`, se necessário
- Reativar a proteção contra senha vazada no Supabase Auth quando houver base real
  de usuários

---

## Backlog priorizado

| Prioridade | Item | Por quê |
|---|---|---|
| 0 | Paginar o catálogo no modo Supabase | Sem isso a galeria corta em 1000 recursos após a próxima importação |
| 1 | Repassar acessos por mensagem direta a quem assume | Sem isso o catálogo congela |
| 2 | Decidir entre consolidar no Supabase ou voltar para a EC2 | O débito dos dois backends só cresce enquanto não há decisão |
| 3 | Excluir o projeto Supabase `adungjmhuibxvgiqrume` | Decidido: elimina a ambiguidade sobre qual é a produção |
| 4 | Cadastrar os secrets do workflow de ping e remover o gatilho de push | Hoje funciona com valor embutido |
| 5 | Medir quantos recursos aceitam `iframe` | Dimensiona o risco do visualizador |
| 6 | SSO JumpCloud | Tira o login com senha manual |
| 7 | Teste end-to-end do fluxo de login e galeria | Única forma de detectar quebra dos dois backends |
| 8 | Reduzir o bundle inicial | Aviso do Vite, sem impacto relatado por usuário |
| 9 | Revisar `src/guidelines/Guidelines.md` | Pode estar descrevendo estilo que não se aplica mais |

---

## Bugs conhecidos

- **Catálogo cortado em 1000 linhas no modo Supabase.** A Data API devolve no máximo
  1000 linhas por consulta, mesmo com `range(0, 2499)` em `supabaseFetchOdas`.
  Medido em 2026-10-19: o admin recebe `0-999/1194` e vê 803 recursos na galeria em
  vez de 997. Usuário comum ainda não é afetado porque recebe só os 997 visíveis, mas
  **passa a ser** assim que a importação levar os visíveis acima de 1000. Correção
  proposta: paginar a consulta em blocos de 1000. Bloqueia a importação da planilha
  nova. O modo Express não tem o problema.
- **Visualizador em tela ampliada abre em branco** em recursos cujo servidor recusa
  `iframe`. Não há fallback de abertura externa nem sinalização automática na fila
  de revisão. Frequência desconhecida.
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

### Visualizador do recurso em tela ampliada

A pedido da coordenação, a experiência é explorar o recurso dentro do Acervo em vez
de compartilhar o link: "Copiar Link" virou "Copiar código" e "Abrir em outra
janela" virou um modal em tela ampliada, para audiovisual e ODA
(`src/components/ProjectDetailsPage.tsx`).

Pontos a acompanhar:

- Esconder o link é fricção, não proteção: o endereço do `iframe` continua visível
  no HTML da página.
- Vimeo e YouTube aceitam `iframe`, mas ODAs de terceiros podem recusar por
  `X-Frame-Options` ou `CSP: frame-ancestors` — nesses casos o modal abre em branco.
- Não há fallback de abertura externa. Se o bloqueio se mostrar frequente, decidir
  entre reintroduzir a abertura externa ou sinalizar o recurso na revisão do admin.
- Medir quantos links publicados aceitam `iframe` para dimensionar esse risco.

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
  abandonada. A resposta muda a prioridade 2 do backlog.
