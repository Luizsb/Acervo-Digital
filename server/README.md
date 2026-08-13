# Backend - Acervo Digital

API Node.js + Express + Prisma. Documentação completa na **raiz do repositório**: [README.md](../README.md).

## Uso rápido (dentro de `server/`)

```bash
# Na raiz do repositório
copy server\.env.example server\.env
npm run setup
npm run server:dev
```

`npm run setup` sobe o Postgres, aplica migrações e executa o seed (BNCC, usuário demo e planilha).

Para sincronizar uma planilha nova sem apagar o banco:

```bash
npm run import:categorizacao
```

`--clear` apaga a tabela `odas` e só deve ser usado em reset local.
