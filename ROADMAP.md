# Roadmap — Acervo Digital

Documentação versionada do produto. Canvases locais do Cursor são rascunhos de trabalho e não substituem este arquivo.

## Lançamento 1 (atual)

- Catálogo único de ODAs e audiovisual a partir da planilha de categorização
- Login local (usuário demo) e galeria autenticada
- Painel admin: fila de revisão e sincronização da planilha com feedback (novos, atualizados, sem thumb)
- Rotina agendada no Apps Script envia a planilha para o webhook da API
- Painel admin exibe data e origem da última sincronização
- Filtros de localização editorial: Coleção, Livro, Bloco/Capítulo, Envio à escola, Volume
- Filtros de currículo: Segmento, Ano/série, Componente, BNCC
- Ficha do recurso, requisitos técnicos normalizados e recomendações relacionadas
- Execução local e na EC2 com Docker (PostgreSQL + API + frontend)
- Sincronização da planilha: cria, atualiza e desativa pelo código do recurso

## Próximo

- SSO JumpCloud no lugar do login demo
- Recaptura de thumbs sob demanda a partir do painel admin
- HTTPS (443) e domínio na EC2
- Política de atualização periódica da planilha oficial no repositório

## Em observação

### Visualizador do recurso em tela ampliada

A pedido da coordenação, a experiência é explorar o recurso dentro do Acervo em vez de
compartilhar o link: "Copiar Link" virou "Copiar código" e "Abrir em outra janela" virou
um modal em tela ampliada, para audiovisual e ODA (`src/components/ProjectDetailsPage.tsx`).

Pontos a acompanhar:

- Esconder o link é fricção, não proteção: o endereço do `iframe` continua visível no HTML da página
- Vimeo e YouTube aceitam `iframe`, mas ODAs de terceiros podem recusar por `X-Frame-Options` / `CSP: frame-ancestors` — nesses casos o modal abre em branco
- Não há fallback de abertura externa: se o bloqueio se mostrar frequente, decidir entre reintroduzir a abertura externa ou sinalizar o recurso na revisão do admin
- Medir quantos links publicados aceitam `iframe` para dimensionar esse risco
