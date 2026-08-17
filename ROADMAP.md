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

## Em estudo

### Visualizador do recurso em tela ampliada

Ideia trazida pela coordenação: em vez de compartilhar o link, a pessoa explora o
recurso dentro do Acervo (modal grande, para vídeos e ODAs) e, se gostar, guarda o
código do recurso. O botão "Copiar Link" já está desativado (`SHARE_LINK_ENABLED`
em `src/components/ProjectDetailsPage.tsx`).

Pontos a resolver antes de implementar:

- Esconder o link é fricção, não proteção: o endereço continua acessível pelo HTML da página e pelo botão "Abrir em outra janela"
- Vimeo e YouTube aceitam `iframe` (já usado no tipo Audiovisual), mas ODAs de terceiros podem recusar por `X-Frame-Options` / `CSP: frame-ancestors`
- Medir quantos links publicados aceitam `iframe` para decidir se o modal é a experiência principal ou um complemento
- Definir o fallback quando o recurso não puder ser embutido (provavelmente manter "Abrir em outra janela")
- Avaliar trocar o botão desativado por "Copiar código" do recurso
