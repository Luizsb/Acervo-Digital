import express from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { authMiddleware, signToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const SALT_ROUNDS = 10;
const PASSWORD_MAX_LENGTH = 14;

// Rate limit: 5 tentativas por IP a cada 15 minutos para login/registro
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }
    const emailTrim = String(email).trim().toLowerCase();
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
      return res.status(400).json({ error: `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.` });
    }
    const existing = await prisma.user.findUnique({ where: { email: emailTrim } });
    if (existing) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: emailTrim,
        passwordHash,
        name: name ? String(name).trim() : null,
        role: 'user',
      },
    });
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Auth register error:', err);
    res.status(500).json({ error: err.message || 'Erro ao cadastrar.' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }
    const emailTrim = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailTrim } });
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Auth login error:', err);
    res.status(500).json({ error: err.message || 'Erro ao entrar.' });
  }
});

// GET /api/auth/me - requer token
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado.' });
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err: any) {
    console.error('Auth me error:', err);
    res.status(500).json({ error: err.message || 'Erro ao buscar usuário.' });
  }
});

// PATCH /api/auth/me - atualizar nome (e opcionalmente senha)
router.patch('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado.' });
    const { name, currentPassword, newPassword } = req.body;
    const data: { name?: string; passwordHash?: string } = {};
    if (typeof name === 'string' && name.trim()) data.name = name.trim();
    if (typeof newPassword === 'string' && newPassword.length >= 6) {
      if (newPassword.length > PASSWORD_MAX_LENGTH) return res.status(400).json({ error: `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.` });
      if (!currentPassword) return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha.' });
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
      const valid = await bcrypt.compare(String(currentPassword), user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Senha atual incorreta.' });
      data.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Nenhum dado válido para atualizar.' });
    }
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(user);
  } catch (err: any) {
    console.error('Auth patch me error:', err);
    res.status(500).json({ error: err.message || 'Erro ao atualizar.' });
  }
});

// POST /api/auth/logout - no servidor não invalidamos token (stateless JWT); cliente remove o token
router.post('/logout', (_req, res) => {
  res.json({ ok: true });
});

// POST /api/auth/forgot-password - orienta a contatar o administrador (sem envio de e-mail nem geração de token)
router.post('/forgot-password', authLimiter, (_req, res) => {
  res.json({
    message: 'Para redefinir sua senha, entre em contato com o administrador do sistema.',
  });
});

// POST /api/auth/reset-password - redefinir senha com token
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    if (newPassword.length > PASSWORD_MAX_LENGTH) {
      return res.status(400).json({ error: `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.` });
    }
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });
    if (!user) {
      return res.status(400).json({ error: 'Link inválido ou expirado. Solicite uma nova redefinição.' });
    }
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });
    res.json({ message: 'Senha alterada com sucesso. Faça login com a nova senha.' });
  } catch (err: any) {
    console.error('Auth reset-password error:', err);
    res.status(500).json({ error: err.message || 'Erro ao redefinir senha.' });
  }
});

export default router;
