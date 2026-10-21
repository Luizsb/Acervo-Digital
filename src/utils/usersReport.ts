import type { AdminUserItem } from './api/types';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  user: 'Leitor',
};

export function roleLabel(papel: string): string {
  return ROLE_LABELS[papel] ?? papel;
}

export function formatReportDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR');
}

/** Célula iniciada por = + - @ vira fórmula no Excel; o apóstrofo neutraliza (CSV injection). */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** CSV com `;` e BOM, que o Excel em português abre com acentos e colunas certas. */
export function usersToCsv(users: AdminUserItem[]): string {
  const header = ['E-mail', 'Perfil', 'Criado em', 'Último acesso'];
  const rows = users.map((user) => [
    user.email,
    roleLabel(user.papel),
    formatReportDate(user.criadoEm),
    formatReportDate(user.ultimoAcesso),
  ]);
  return '\uFEFF' + [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n');
}
