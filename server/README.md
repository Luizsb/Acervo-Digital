# Backend - Acervo Digital

API Node.js + Express + Prisma. Instalação e comandos: [README.md](../README.md). Arquitetura, regras de negócio e rotina de operação: [docs/SDD.md](../docs/SDD.md). Planejamento: [docs/ROADMAP.md](../docs/ROADMAP.md).

> Esta API corresponde ao modo `VITE_BACKEND=ec2`. O nome é histórico: o modo é o
> Express, usado no desenvolvimento local. A produção atual roda sobre o Supabase e
> não passa por aqui. A imagem Docker da API foi removida com a EC2 em 2026-10-20.

## API local, banco no Docker

Na raiz do repositório:

```bash
npm run setup
npm run server:dev
```

Sobe só o Postgres, aplica migrações, importa a planilha e deixa a API em http://localhost:3001.
