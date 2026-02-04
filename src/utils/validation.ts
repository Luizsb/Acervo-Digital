/**
 * Validação de e-mail (formato básico).
 * Evita enviar requisição ao backend com e-mail inválido.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 && EMAIL_REGEX.test(trimmed);
}
