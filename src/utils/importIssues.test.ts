import { describe, expect, it } from 'vitest';
import { buildImportIssues } from '../../server/lib/importIssues';

const row = (linha: number, codigo: string, titulo = `Recurso ${linha}`, status = 'Funcionando') => ({
  linha,
  codigo,
  titulo,
  status,
  linkRepositorio: 'https://exemplo.com',
});

describe('buildImportIssues', () => {
  it('lista linha sem código sem guardar o código provisório', () => {
    const issues = buildImportIssues([row(10, 'PLANILHA_L10', ' Sem código ', 'Quebrado')], new Map());
    expect(issues).toEqual([
      {
        kind: 'sem-codigo',
        linha: 10,
        codigo: null,
        titulo: 'Sem código',
        status: 'Quebrado',
        linkRepositorio: 'https://exemplo.com',
        vigente: false,
      },
    ]);
  });

  it('lista cada linha de código repetido e marca a que ficou valendo', () => {
    const issues = buildImportIssues(
      [row(5, 'A', 'Walt Disney'), row(6, 'B'), row(9, 'A', 'Noções de desenho', 'Não avaliado')],
      new Map([['A', 5]])
    );
    expect(issues.map(({ kind, linha, codigo, titulo, vigente }) => ({ kind, linha, codigo, titulo, vigente }))).toEqual([
      { kind: 'codigo-repetido', linha: 5, codigo: 'A', titulo: 'Walt Disney', vigente: true },
      { kind: 'codigo-repetido', linha: 9, codigo: 'A', titulo: 'Noções de desenho', vigente: false },
    ]);
  });

  it('não acusa nada numa planilha sem problema', () => {
    expect(buildImportIssues([row(1, 'A'), row(2, 'B')], new Map())).toEqual([]);
  });
});
