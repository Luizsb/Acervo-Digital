/**
 * Descarte por prazo de retenção: auditoria com mais de 6 meses e registros individuais
 * de visualização de dias anteriores. Também roda no fim de cada importação sem erro.
 *
 * Uso: npm run db:descartar
 */
import os from 'os';
import prisma from '../lib/prisma';
import { recordAuditEvent } from '../lib/audit';
import { discardExpiredData } from '../lib/retention';
import { AUDIT_RETENTION_MONTHS } from '../lib/retentionPolicy';

function operatorName(): string {
  try {
    return process.env.ACERVO_OPERADOR || os.userInfo().username;
  } catch {
    return 'desconhecido';
  }
}

async function main() {
  const summary = await discardExpiredData();
  await recordAuditEvent({
    action: 'data.discarded',
    origin: 'cli',
    actor: operatorName(),
    details: { ...summary, prazoAuditoriaMeses: AUDIT_RETENTION_MONTHS },
  });
  console.log(`🧹 Descarte concluído`);
  console.log(`   auditoria com mais de ${AUDIT_RETENTION_MONTHS} meses: ${summary.auditEvents}`);
  console.log(`   visualizações individuais de dias anteriores: ${summary.viewEvents}`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
