import { describe, expect, it } from 'vitest';
import { AUDIT_RETENTION_MONTHS, auditRetentionCutoff } from '../../server/lib/retentionPolicy';

describe('auditRetentionCutoff', () => {
  it('usa 6 meses, o prazo do mapeamento da DPO', () => {
    expect(AUDIT_RETENTION_MONTHS).toBe(6);
  });

  it('devolve a data 6 meses antes, sem alterar a data de referência', () => {
    const now = new Date('2026-11-04T12:00:00.000Z');
    expect(auditRetentionCutoff(now).toISOString()).toBe('2026-05-04T12:00:00.000Z');
    expect(now.toISOString()).toBe('2026-11-04T12:00:00.000Z');
  });
});
