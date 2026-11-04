import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// O pooler 6543 (PgBouncer, modo transação) quebra o migrate: o CLI usa a sessão direta
// (DIRECT_URL, porta 5432). No Postgres local os dois apontam para o mesmo banco.
// Sem nenhuma das duas (CI), o `prisma generate` funciona; só o migrate precisa da URL.
const migrationUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  ...(migrationUrl ? { datasource: { url: migrationUrl } } : {}),
});
