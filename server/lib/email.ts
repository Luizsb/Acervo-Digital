import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@acervodigital.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error('Envio de e-mail não configurado. Configure SMTP_HOST, SMTP_USER e SMTP_PASS no .env');
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  const resetUrl = `${APP_URL.replace(/\/$/, '')}/#/redefinir-senha`;
  const text = `Você solicitou a redefinição de senha no Acervo Digital.\n\nUse o token abaixo na plataforma (página Redefinir senha) para definir sua nova senha. O token expira em 1 hora.\n\nToken: ${token}\n\nAcesse: ${resetUrl}\n\nSe você não solicitou isso, ignore este e-mail.`;
  const html = `
    <p>Você solicitou a redefinição de senha no <strong>Acervo Digital</strong>.</p>
    <p>Use o token abaixo na plataforma (página <strong>Redefinir senha</strong>) para definir sua nova senha. O token expira em <strong>1 hora</strong>.</p>
    <p style="background:#f0f0f0;padding:12px;font-family:monospace;word-break:break-all;">${token}</p>
    <p><a href="${resetUrl}">Acessar página Redefinir senha</a></p>
    <p style="color:#666;font-size:12px;">Se você não solicitou isso, ignore este e-mail.</p>
  `;
  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: 'Redefinição de senha - Acervo Digital',
    text,
    html,
  });
}
