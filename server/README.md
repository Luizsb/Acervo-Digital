# Backend - Acervo Digital

API Node.js + Express + Prisma. Documentação completa na **raiz do repositório**: [README.md](../README.md).

## Uso rápido (dentro de `server/`)

```bash
# Na raiz do repositório: sobe o Postgres
npm run db:up

npm ci
# Copie .env.example para .env (DATABASE_URL local já está no exemplo)
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run import:categorizacao -- --clear
npm run dev             # http://localhost:3001
npm run prisma:studio   # http://localhost:5555
```
