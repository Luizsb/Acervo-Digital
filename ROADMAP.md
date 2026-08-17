# Roadmap — Acervo Digital

Documentação versionada do produto. Canvases locais do Cursor são rascunhos de trabalho e não substituem este arquivo.

## Lançamento 1 (atual)

- Catálogo único de ODAs e audiovisual a partir da planilha de categorização
- Login local (usuário demo) e galeria autenticada
- Painel admin: fila de revisão e sincronização da planilha com feedback (novos, atualizados, sem thumb)
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
