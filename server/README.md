# Backend - Acervo Digital

API Node.js + Express + Prisma. Documentação completa na **raiz do repositório**: [README.md](../README.md).

## Uso rápido (dentro de `server/`)

```bash
npm install
# Configure .env (DATABASE_URL, PORT, CORS_ORIGIN, JWT_SECRET, JWT_EXPIRES_IN)
npx prisma generate
npx prisma migrate dev   # ou npx prisma db push
npm run dev             # http://localhost:3001
npm run prisma:studio   # http://localhost:5555
```
