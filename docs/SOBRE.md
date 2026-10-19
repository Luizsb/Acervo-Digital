# 💡 Sobre o Acervo Digital

## Em uma frase

Uma biblioteca interna onde o time editorial encontra, filtra e abre os Objetos
Digitais de Aprendizagem e o audiovisual das coleções, sem depender de planilha.

## Problema que resolve

O catálogo de recursos digitais de terceiros vivia numa planilha de categorização.
Achar um recurso significava abrir o `.xlsx`, filtrar colunas, copiar um link e
descobrir na tentativa se ele ainda funcionava. Não havia como ver a capa do
recurso, saber quais habilidades da BNCC ele cobre nem separar o que está publicável
do que está quebrado.

O Acervo Digital transforma essa planilha em produto: a informação editorial
continua sendo mantida na planilha, mas quem consulta usa uma galeria com busca,
filtros, capa, ficha pedagógica e acesso direto ao recurso.

## Para quem é

- **Time de Interações Digitais** — quem produz e cura os recursos.
- **NDE** — quem valida a aderência pedagógica e curricular.
- **Editores das coleções** — quem precisa localizar recurso por coleção, livro,
  bloco ou capítulo para montar material.
- **Administradores do acervo** — quem cuida da qualidade: fila de revisão,
  sincronização da planilha e captura de capas.

## O que faz hoje

Entrada por login. Depois de autenticado, o usuário cai numa galeria de recursos
ordenada pelos mais visualizados, com busca por texto e filtros em duas famílias:
localização editorial (coleção, livro, bloco/capítulo, envio à escola, volume) e
currículo (segmento, ano/série, componente, habilidade BNCC).

Cada recurso tem ficha própria com capa, requisitos técnicos normalizados,
habilidades BNCC com o texto completo e recomendações relacionadas. Vídeos abrem em
um modal em tela ampliada, dentro do Acervo; ODAs e demais recursos abrem em nova
guia, porque embarcados parte deles cortava o conteúdo ou não carregava. O histórico
dessa decisão está no `ROADMAP.md`.

Administradores têm um painel próprio com a fila de revisão (tudo que não entra na
galeria e por quê), o status da última sincronização da planilha, o histórico de
recursos novos e atualizados com as capas, o ranking de acessos e a captura de capas
faltantes.

## Funcionalidades prontas

- Login autenticado e sessão persistente.
- Galeria com busca, filtros combináveis, paginação e alternância entre grade e lista.
- Ordenação do catálogo pelos recursos mais visualizados.
- Ficha do recurso com BNCC, requisitos técnicos e relacionados.
- Vídeo em tela ampliada; ODA e demais recursos em nova guia.
- Favoritos por usuário.
- Contagem de visualizações, separando visita à ficha de abertura do recurso.
- Painel admin: fila de revisão, status da planilha, histórico de novos e
  atualizados com capas, ranking de acessos, captura de capas.
- Importação da planilha criando, atualizando, desativando e reativando pelo código
  do recurso.
- Captura automatizada de capas em WebP.
- Tour de onboarding no primeiro acesso.

## Funcionalidades parciais

- **SSO JumpCloud** — existe o botão na tela de login, mas é placeholder. O login
  real hoje é e-mail e senha.
- **Recuperação de senha** — funciona no backend Express; desativada no modo Supabase.
- **Importação da planilha e captura de capas** — rodam apenas na máquina de quem
  mantém o projeto. Na Vercel esses comandos são bloqueados de propósito, porque não
  há host Node com Playwright. Veja o runbook no `SDD.md`.
- **Sincronização diária automática** — o gatilho do Google Apps Script existe e
  está escrito, mas aponta para a API da instância AWS, que está inacessível. Está
  parado.

## Hipótese de valor

Se o time encontrar um recurso em segundos, com a capa visível e a garantia de que o
link funciona, o reaproveitamento de recursos digitais nas coleções aumenta e o
retrabalho de curadoria cai. A fila de revisão dá ao administrador a lista exata do
que precisa de conserto, em vez de a descoberta acontecer por reclamação de usuário.

`[A VALIDAR]` A hipótese ainda não foi medida. Há contagem de visualizações no banco,
mas nenhuma meta definida nem comparação com o cenário anterior.

## Discovery resumido

**Por que existe.** A planilha resolvia o cadastro, não a consulta. Quem precisava
usar o recurso não era quem o categorizava.

**Por que a planilha continua no fluxo.** A categorização editorial é trabalho
humano feito em planilha, com histórico e várias pessoas envolvidas. Substituir isso
por um CRUD na aplicação seria um projeto muito maior. A decisão foi manter a
planilha como origem e tratá-la como fonte de importação, não como banco de dados.

**Por que as capas não ficam no banco.** São mais de mil imagens. Guardá-las como
`BYTEA` deixaria o PostgreSQL pesado. O banco guarda o caminho, o arquivo vai para o
disco e para o Git.

**Por que o vídeo abre dentro do Acervo e o ODA não.** A coordenação pediu que o
recurso fosse explorado no contexto do acervo, e o modal foi feito para os dois.
Na prática, o ODA embarcado cortava jogos fora de 16:9 e parte deles não terminava
de carregar; em outubro de 2026 o ODA passou a abrir em nova guia. O vídeo, que
funciona bem embarcado, continua no modal.

## Pitch em 30 segundos

O Acervo Digital é a vitrine dos recursos digitais das nossas coleções. A planilha de
categorização continua sendo a origem do dado editorial, mas o time passou a
consultar uma galeria: busca, filtro por coleção ou por habilidade da BNCC, capa de
cada recurso e o próprio recurso abrindo na tela. O administrador vê numa fila o que
está quebrado, restrito ou incompleto, e a planilha nova entra no ar com um comando.

## Momento atual

O produto está **no ar e em uso**, hospedado na Vercel com banco e autenticação no
Supabase. Essa arquitetura foi adotada em agosto de 2026 como resposta à perda de
acesso à instância AWS, com custo zero.

A infraestrutura anterior — Docker com PostgreSQL, API Express e nginx na EC2 —
continua inteira no repositório e é o plano de retorno. Trocar de volta é mudar a
variável `VITE_BACKEND`.

**O ponto de atenção do momento é operacional, não de produto.** A atualização do
catálogo e a captura de capas dependem de um ambiente Node local configurado. Com a
transferência de responsabilidade em setembro de 2026, quem assume precisa desse
ambiente na própria máquina ou o catálogo congela. O runbook está no `SDD.md`.

## Mapa da documentação

| Onde | O que você encontra |
|------|---------------------|
| `docs/SOBRE.md` | Este arquivo: visão de negócio, público e valor |
| `docs/SDD.md` | Arquitetura, regras de negócio e **o runbook de operação** |
| `docs/ROADMAP.md` | Fases, backlog, bugs conhecidos e débitos técnicos |
| `docs/CHANGELOG_EVIDENCES.md` | Decisões tomadas e evidências de entrega |
| `docs/visao-projeto.html` | Leitura visual dos quatro arquivos acima |
| `README.md` | Instalação, comandos e solução de problemas |
| `.cursorrules` | O processo que a IA é obrigada a seguir neste repositório |
| `src/guidelines/Guidelines.md` | Diretrizes de interface |

**Comece pelo `SDD.md`** se você acabou de assumir o projeto: a seção "Rotina de
operação" é o que mantém o acervo funcionando.

## Pontos a complementar

- `[PERGUNTA AO RESPONSÁVEL]` Quem passa a responder pelo produto a partir de
  setembro de 2026, e quem responde pela operação técnica? Podem ser pessoas
  diferentes.
- `[A VALIDAR]` Volume atual do catálogo. A ordem de grandeza é de mil e duzentos
  recursos, divididos entre audiovisual e OED, mas o número exato deve ser lido no
  painel admin, não fixado aqui.
- `[A VALIDAR]` Quantos usuários reais usam o acervo hoje e com que frequência.
- `[A VALIDAR]` Se há prazo ou compromisso assumido para o SSO JumpCloud.
- `[HIPÓTESE — CONFIRMAR]` O nome "Interações Digitais" é o time responsável;
  confirmar a nomenclatura oficial da área para uso em documentação externa.
