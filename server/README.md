# Backend - Acervo Digital

API Node.js + Express + Prisma. Instalação e comandos: [README.md](../README.md). Arquitetura, regras de negócio e rotina de operação: [docs/SDD.md](../docs/SDD.md). Planejamento: [docs/ROADMAP.md](../docs/ROADMAP.md).

> Esta API corresponde ao modo `VITE_BACKEND=ec2`, usado no desenvolvimento local e
> guardado como plano de retorno para a instância AWS. A produção atual roda sobre o
> Supabase e não passa por aqui.

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
