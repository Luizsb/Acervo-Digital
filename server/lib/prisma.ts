import { PrismaClient } from '@prisma/client';

// Criar instância única do PrismaClient para compartilhar entre módulos
// Isso evita esgotar o connection pool do Supabase
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Garantir que conexões sejam fechadas ao encerrar
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

