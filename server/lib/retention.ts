import prisma from './prisma';
import { discardPastIndividualViews, todayInSaoPaulo } from './odaViews';
import { auditRetentionCutoff } from './retentionPolicy';

export type DiscardSummary = {
  auditEvents: number;
  viewEvents: number;
};

/**
 * Apaga o que passou do prazo: auditoria com mais de 6 meses e registros individuais de
 * visualização de dias anteriores (Express e, no Supabase, auth_view_events).
 */
export async function discardExpiredData(now = new Date()): Promise<DiscardSummary> {
  const audit = await prisma.auditEvent.deleteMany({
    where: { occurredAt: { lt: auditRetentionCutoff(now) } },
  });

  const today = todayInSaoPaulo(now);
  let viewEvents = await discardPastIndividualViews(today);

  const [supabaseViews] = await prisma.$queryRaw<{ exists: boolean }[]>`
    select to_regclass('public.auth_view_events') is not null as exists`;
  if (supabaseViews?.exists) {
    viewEvents += await prisma.$executeRaw`
      delete from public.auth_view_events where viewed_on < ${today}::date`;
  }

  return { auditEvents: audit.count, viewEvents };
}
