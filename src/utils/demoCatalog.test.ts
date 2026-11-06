import { describe, expect, it } from 'vitest';
import { toDemoOda, withoutSourceFields } from '../../server/lib/demoCatalog';

describe('carga de demonstração', () => {
  const source = {
    id: 42,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    codigoOda: 'SAE25_EI_G4_BL2_UT4_OD1',
    titulo: 'Obras de arte no prato',
    pageViewCount: 71,
    openViewCount: 20,
  };

  it('tira id e datas do banco de origem e zera os contadores de uso', () => {
    expect(toDemoOda(source)).toEqual({
      codigoOda: 'SAE25_EI_G4_BL2_UT4_OD1',
      titulo: 'Obras de arte no prato',
      pageViewCount: 0,
      openViewCount: 0,
    });
  });

  it('não altera a linha original', () => {
    toDemoOda(source);
    expect(source.id).toBe(42);
    expect(source.pageViewCount).toBe(71);
  });

  it('tira id e datas da BNCC', () => {
    const bncc = { id: 1, createdAt: null, updatedAt: null, codigo: 'EF01LP01' };
    expect(withoutSourceFields(bncc)).toEqual({ codigo: 'EF01LP01' });
  });
});
