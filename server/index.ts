import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import prisma from './lib/prisma';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import bnccRoutes from './routes/bncc';
import favoritesRoutes from './routes/favorites';
import odasRoutes from './routes/odas';
import syncRoutes from './routes/sync';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

/**
 * Quantidade de proxies entre o cliente e a API: só o nginx conta 1; com o
 * Caddy na frente, 2. Um valor menor que o real faz o limitador de requisições
 * enxergar o IP do proxy no lugar do usuário e bloquear todos de uma vez.
 * `true` continua aceito e equivale a 1.
 */
function parseTrustedProxies(value?: string): number {
  if (!value || value === 'false') return 0;
  if (value === 'true') return 1;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

const trustedProxies = parseTrustedProxies(process.env.TRUST_PROXY);
if (trustedProxies > 0) {
  app.set('trust proxy', trustedProxies);
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/database', async (_req, res) => {
  try {
    await prisma.oDA.findFirst({ select: { id: true } });
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(503).json({ status: 'error', database: 'unavailable', error: message });
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});
app.use('/api', apiLimiter);

app.use('/api/odas', odasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/bncc', bnccRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users/me/favorites', favoritesRoutes);

app.use(
  (
    error: Error & { status?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Erro não tratado:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Erro interno do servidor',
    });
  }
);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`API disponível em http://localhost:${PORT}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error('Erro no servidor:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso.`);
  }
});

async function shutdown(signal: string) {
  console.log(`${signal} recebido; encerrando servidor.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

export default app;
