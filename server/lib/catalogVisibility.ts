/**
 * Visibilidade no acervo público (galeria).
 * Só entra quem tem Status do link = Funcionando E link do recurso preenchido.
 * Em branco, quebrado, incorreto, demais status e cards sem destino ficam no
 * banco para o painel admin.
 */
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

export function hasCatalogStatus(status?: string | null): boolean {
  return normalizeCatalogStatus(status) === normalizeCatalogStatus(CATALOG_VISIBLE_STATUS);
}

/** Card sem link não tem para onde levar o usuário, então não pode publicar. */
export function hasResourceLink(link?: string | null): boolean {
  return Boolean(link && link.trim());
}

export function isVisibleInCatalog(
  status: string | null | undefined,
  linkRepositorio: string | null | undefined
): boolean {
  return hasCatalogStatus(status) && hasResourceLink(linkRepositorio);
}

/** Cláusula Prisma: status Funcionando e link preenchido. */
export function catalogVisibleWhere() {
  return {
    status: { equals: CATALOG_VISIBLE_STATUS, mode: 'insensitive' as const },
    AND: [{ linkRepositorio: { not: null } }, { NOT: { linkRepositorio: '' } }],
  };
}

/** Cláusula Prisma: fila de revisão (tudo que não entra na galeria). */
export function catalogReviewWhere() {
  return {
    ativo: true as const,
    OR: [
      { status: null },
      { status: { equals: '' } },
      {
        AND: [
          { status: { not: null } },
          { NOT: { status: { equals: CATALOG_VISIBLE_STATUS, mode: 'insensitive' as const } } },
        ],
      },
      { linkRepositorio: null },
      { linkRepositorio: { equals: '' } },
    ],
  };
}

export type ReviewGroup =
  | 'sem-link'
  | 'em-cadastro'
  | 'quebrado'
  | 'incorreto'
  | 'acesso-restrito'
  | 'nao-avaliado'
  | 'duvida'
  | 'outro';

export const REVIEW_GROUP_LABELS: Record<ReviewGroup, string> = {
  'sem-link': 'Sem link',
  'em-cadastro': 'Em cadastro',
  quebrado: 'Quebrado',
  incorreto: 'Incorreto',
  'acesso-restrito': 'Acesso restrito',
  'nao-avaliado': 'Não avaliado',
  duvida: 'Dúvida para revisão',
  outro: 'Outro',
};

export const REVIEW_GROUP_ORDER: ReviewGroup[] = [
  'sem-link',
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

/**
 * Agrupa um item da fila de revisão. Status Funcionando sem link cai em
 * "Sem link": a planilha diz que está ok, mas falta o endereço do recurso.
 */
export function reviewGroupFor(item: {
  status?: string | null;
  linkRepositorio?: string | null;
}): ReviewGroup {
  if (hasCatalogStatus(item.status) && !hasResourceLink(item.linkRepositorio)) {
    return 'sem-link';
  }
  return reviewGroupFromStatus(item.status);
}
