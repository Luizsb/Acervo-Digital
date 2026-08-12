import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const configuredJwtSecret = process.env.JWT_SECRET?.trim();

if (process.env.NODE_ENV === 'production' && !configuredJwtSecret) {
  throw new Error('JWT_SECRET é obrigatório em produção.');
}

// Mantém o ambiente local simples sem permitir um segredo padrão em produção.
const JWT_SECRET = configuredJwtSecret || 'acervo-digital-local-demo-only';

export interface JwtPayload {
  userId: number;
  email: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não informado.' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

export function signToken(payload: JwtPayload): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}
