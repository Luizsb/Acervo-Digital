export const CATALOG_VISIBLE_STATUS = 'Funcionando';

export const CATALOG_ATTENTION_STATUSES = [
  'Acesso restrito',
  'Quebrado',
  'Incorreto',
  'Não avaliado',
  'Dúvida para revisão',
] as const;

export function normalizeCatalogStatus(value?: string | null): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function isVisibleInCatalog(status?: string | null): boolean {
  return normalizeCatalogStatus(status) === normalizeCatalogStatus(CATALOG_VISIBLE_STATUS);
}

export type ReviewGroup =
  | 'em-cadastro'
  | 'quebrado'
  | 'incorreto'
  | 'acesso-restrito'
  | 'nao-avaliado'
  | 'duvida'
  | 'outro';

export const REVIEW_GROUP_LABELS: Record<ReviewGroup, string> = {
  'em-cadastro': 'Em cadastro',
  quebrado: 'Quebrado',
  incorreto: 'Incorreto',
  'acesso-restrito': 'Acesso restrito',
  'nao-avaliado': 'Não avaliado',
  duvida: 'Dúvida para revisão',
  outro: 'Outro',
};

export const REVIEW_GROUP_ORDER: ReviewGroup[] = [
  'quebrado',
  'incorreto',
  'acesso-restrito',
  'duvida',
  'nao-avaliado',
  'em-cadastro',
  'outro',
];

export function reviewGroupFromStatus(status?: string | null): ReviewGroup {
  const key = normalizeCatalogStatus(status);
  if (!key) return 'em-cadastro';
  if (key.includes('quebrado')) return 'quebrado';
  if (key.includes('incorreto')) return 'incorreto';
  if (key.includes('acesso restrito') || key.includes('restrito')) return 'acesso-restrito';
  if (key.includes('nao avaliado')) return 'nao-avaliado';
  if (key.includes('duvida')) return 'duvida';
  return 'outro';
}

export function isAdminRole(role?: string | null): boolean {
  return role === 'admin';
}
