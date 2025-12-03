import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import odasRoutes from './routes/odas';
import migrationRoutes from './routes/migration';
import bnccRoutes from './routes/bncc';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/odas', odasRoutes);
app.use('/api/migration', migrationRoutes);
app.use('/api/bncc', bnccRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Verificar e migrar dados automaticamente se necessário
async function checkAndSeedDatabase() {
  try {
    // Aguardar um pouco para garantir que o Prisma está conectado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const bnccCount = await (prisma as any).bNCC.count();
    const odasCount = await prisma.oDA.count();
    
    if (bnccCount === 0 || odasCount === 0) {
      console.log('⚠️ Banco de dados vazio detectado.');
      console.log('📝 Para migrar os dados, execute:');
      console.log('   1. POST /api/bncc/migrate (para BNCC)');
      console.log('   2. POST /api/migration/excel (para ODAs)');
      console.log('   Ou execute: npm run seed');
    } else {
      console.log(`✅ ${bnccCount} habilidades BNCC e ${odasCount} ODAs já estão no banco`);
    }
  } catch (error: any) {
    // Se o erro for de banco não encontrado, apenas avisar (não quebrar o servidor)
    if (error.code === 'P1001' || error.message?.includes('Unable to open')) {
      console.warn('⚠️ Banco de dados ainda não está disponível. Execute as migrations primeiro.');
      console.warn('📝 Execute: npx prisma migrate deploy');
    } else {
      console.warn('⚠️ Erro ao verificar dados:', error.message || error);
    }
  }
}

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Prisma connected to database`);
  
  // Verificar dados em background (não bloquear o servidor)
  checkAndSeedDatabase().catch(console.error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed');
  });
});

export default app;

