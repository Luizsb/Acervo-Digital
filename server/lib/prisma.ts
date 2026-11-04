import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { postgresPoolConfig } from './databaseConnection';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL não definido. Configure o server/.env (veja server/.env.example).');
}

// Instância única para todos os módulos, para não abrir pools de conexão duplicados.
const prisma = new PrismaClient({
  adapter: new PrismaPg(postgresPoolConfig(databaseUrl)),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
