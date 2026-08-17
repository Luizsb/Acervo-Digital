import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { isVisibleInCatalog } from './catalogVisibility';

export const VIEW_KINDS = ['page', 'open'] as const;
export type ViewKind = (typeof VIEW_KINDS)[number];

export const VIEW_PERIODS = ['7d', '30d', 'all'] as const;
export type ViewPeriod = (typeof VIEW_PERIODS)[number];

const SAO_PAULO_TZ = 'America/Sao_Paulo';

export function isViewKind(value: unknown): value is ViewKind {
  return value === 'page' || value === 'open';
}

export function isViewPeriod(value: unknown): value is ViewPeriod {
  return value === '7d' || value === '30d' || value === 'all';
}

/** Data de calendário em São Paulo, como DATE UTC (meia-noite). */
export function todayInSaoPaulo(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SAO_PAULO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  if (!year || !month || !day) {
    throw new Error('Não foi possível calcular a data em America/Sao_Paulo.');
  }
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export type RecordViewResult = {
  counted: boolean;
  pageViewCount: number;
  openViewCount: number;
};

export async function recordOdaView(params: {
  userId: number;
  odaId: number;
  kind: ViewKind;
}): Promise<RecordViewResult | null> {
  const oda = await prisma.oDA.findUnique({
    where: { id: params.odaId },
    select: {
      id: true,
      ativo: true,
      status: true,
      linkRepositorio: true,
      pageViewCount: true,
      openViewCount: true,
    },
  });

  if (!oda || oda.ativo === false || !isVisibleInCatalog(oda.status, oda.linkRepositorio)) {
    return null;
  }

  const viewedOn = todayInSaoPaulo();
  const counterField = params.kind === 'page' ? 'pageViewCount' : 'openViewCount';

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.odaViewEvent.create({
        data: {
          userId: params.userId,
          odaId: params.odaId,
          kind: params.kind,
          viewedOn,
        },
      });
      return tx.oDA.update({
        where: { id: params.odaId },
        data: { [counterField]: { increment: 1 } },
        select: { pageViewCount: true, openViewCount: true },
      });
    });

    return {
      counted: true,
      pageViewCount: updated.pageViewCount,
      openViewCount: updated.openViewCount,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const current = await prisma.oDA.findUnique({
        where: { id: params.odaId },
        select: { pageViewCount: true, openViewCount: true },
      });
      return {
        counted: false,
        pageViewCount: current?.pageViewCount ?? oda.pageViewCount,
        openViewCount: current?.openViewCount ?? oda.openViewCount,
      };
    }
    throw error;
  }
}

export type TopViewItem = {
  id: number;
  codigoOda: string | null;
  titulo: string;
  count: number;
};

export async function getTopOdaViews(params: {
  kind: ViewKind;
  period: ViewPeriod;
  limit: number;
}): Promise<TopViewItem[]> {
  const counterField = params.kind === 'page' ? 'pageViewCount' : 'openViewCount';

  if (params.period === 'all') {
    const rows = await prisma.oDA.findMany({
      where: { [counterField]: { gt: 0 } },
      orderBy: { [counterField]: 'desc' },
      take: params.limit,
      select: {
        id: true,
        codigoOda: true,
        titulo: true,
        pageViewCount: true,
        openViewCount: true,
      },
    });
    return rows.map((row) => ({
      id: row.id,
      codigoOda: row.codigoOda,
      titulo: row.titulo,
      count: params.kind === 'page' ? row.pageViewCount : row.openViewCount,
    }));
  }

  const today = todayInSaoPaulo();
  const days = params.period === '7d' ? 6 : 29;
  const since = addUtcDays(today, -days);

  const grouped = await prisma.odaViewEvent.groupBy({
    by: ['odaId'],
    where: {
      kind: params.kind,
      viewedOn: { gte: since },
    },
    _count: { odaId: true },
    orderBy: { _count: { odaId: 'desc' } },
    take: params.limit,
  });

  if (grouped.length === 0) return [];

  const odas = await prisma.oDA.findMany({
    where: { id: { in: grouped.map((row) => row.odaId) } },
    select: { id: true, codigoOda: true, titulo: true },
  });
  const byId = new Map(odas.map((oda) => [oda.id, oda]));

  return grouped
    .map((row) => {
      const oda = byId.get(row.odaId);
      if (!oda) return null;
      return {
        id: oda.id,
        codigoOda: oda.codigoOda,
        titulo: oda.titulo,
        count: row._count.odaId,
      };
    })
    .filter((item): item is TopViewItem => item !== null);
}
