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

// Verificar e avisar sobre dados BNCC
async function checkBNCC() {
  try {
    const count = await (prisma as any).bNCC.count();
    if (count === 0) {
      console.log('⚠️ Nenhum dado BNCC encontrado no banco.');
      console.log('📝 Para migrar as habilidades BNCC, execute: POST /api/bncc/migrate');
      console.log('   Ou execute: npm run migrate:bncc');
    } else {
      console.log(`✅ ${count} habilidades BNCC já estão no banco`);
    }
  } catch (error) {
    console.warn('⚠️ Erro ao verificar dados BNCC:', error);
  }
}

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Prisma connected to database`);
  
  // Verificar BNCC em background (não bloquear o servidor)
  checkBNCC().catch(console.error);
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

