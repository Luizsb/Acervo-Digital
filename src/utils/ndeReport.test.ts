import { describe, expect, it } from 'vitest';
import { buildNdeReportRows, countByProblem, type NdeReportItem } from '../../server/lib/ndeReport';

const item = (overrides: Partial<NdeReportItem>): NdeReportItem => ({
  group: 'quebrado',
  codigo: 'X1',
  titulo: 'Recurso',
  status: 'Quebrado',
  linkRepositorio: 'https://exemplo.com',
  linha: null,
  vigente: null,
  ...overrides,
});

describe('buildNdeReportRows', () => {
  it('ordena pela fila de revisão e diz o que fazer em cada problema', () => {
    const rows = buildNdeReportRows([
      item({ group: 'quebrado', codigo: 'B' }),
      item({ group: 'sem-codigo', codigo: null, linha: 2274, titulo: 'Linha 2274 sem título' }),
    ]);
    expect(rows.map((row) => row.problema)).toEqual(['Sem código', 'Quebrado']);
    expect(rows[0]).toMatchObject({ linha: 2274, codigo: '' });
    expect(rows[0].oQueFazer).toContain('Código do recurso');
    expect(rows[1].oQueFazer).toContain('Funcionando');
  });

  it('marca no código repetido qual linha vale e qual foi ignorada, em ordem de linha', () => {
    const rows = buildNdeReportRows([
      item({ group: 'codigo-repetido', codigo: 'A', linha: 1980, vigente: true }),
      item({ group: 'codigo-repetido', codigo: 'A', linha: 1979, vigente: false }),
    ]);
    expect(rows.map((row) => [row.linha, row.observacao])).toEqual([
      [1979, 'Esta linha foi ignorada na importação.'],
      [1980, 'Esta linha é a que vale hoje no Acervo.'],
    ]);
  });
});

describe('countByProblem', () => {
  it('conta por problema e omite os vazios', () => {
    const rows = buildNdeReportRows([item({}), item({ codigo: 'Y' }), item({ group: 'incorreto' })]);
    expect(countByProblem(rows)).toEqual([
      { problema: 'Quebrado', total: 2 },
      { problema: 'Incorreto', total: 1 },
    ]);
  });
});
