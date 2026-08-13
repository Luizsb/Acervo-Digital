# Backend - Acervo Digital

API Node.js + Express + Prisma. Documentação completa: [README.md](../README.md). Roadmap: [ROADMAP.md](../ROADMAP.md).

## Docker (recomendado)

Na raiz do repositório:

```bash
docker compose up --build -d
```

Sobe Postgres, aplica migrações, importa a planilha e deixa a API em http://localhost:3001.

## API local, só o banco no Docker

```bash
copy .env.example .env
cd ..
npm run setup
npm run server:dev
```
