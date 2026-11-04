/**
 * Prazo de retenção da trilha de auditoria: 6 meses, o mínimo do art. 15 do Marco Civil
 * indicado pela DPO no mapeamento de dados (2026-11-04).
 */
export const AUDIT_RETENTION_MONTHS = 6;

/** Eventos de auditoria anteriores a esta data podem ser apagados. */
export function auditRetentionCutoff(now = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - AUDIT_RETENTION_MONTHS);
  return cutoff;
}
