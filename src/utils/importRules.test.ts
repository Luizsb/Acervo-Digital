import { describe, expect, it } from 'vitest';
import { isImportableResource } from '../../server/lib/catalogVisibility';
import { findRepeatedCodes } from '../../server/lib/map-categorizacao';

describe('isImportableResource', () => {
  const link = 'https://exemplo.com/recurso';

  it('cadastra só Funcionando com link e código real', () => {
    expect(isImportableResource({ codigoOda: 'EF21_8_MAT_L1_U1_01_OD1', status: 'Funcionando', linkRepositorio: link })).toBe(true);
    expect(isImportableResource({ codigoOda: 'IMP/63/ALA19', status: ' funcionando ', linkRepositorio: link })).toBe(true);
  });

  it('não cadastra quebrado, incorreto, não avaliado nem status vazio', () => {
    for (const status of ['Quebrado', 'Incorreto', 'Não avaliado', 'Acesso restrito', '', null]) {
      expect(isImportableResource({ codigoOda: 'X1', status, linkRepositorio: link })).toBe(false);
    }
  });

  it('não cadastra Funcionando sem link nem linha sem código', () => {
    expect(isImportableResource({ codigoOda: 'X1', status: 'Funcionando', linkRepositorio: '  ' })).toBe(false);
    expect(isImportableResource({ codigoOda: 'PLANILHA_L2316', status: 'Funcionando', linkRepositorio: link })).toBe(false);
  });
});

describe('findRepeatedCodes', () => {
  it('lista o código repetido com as linhas', () => {
    expect(
      findRepeatedCodes([
        { codigo: 'A', linha: 4 },
        { codigo: 'B', linha: 5 },
        { codigo: 'A', linha: 9 },
      ])
    ).toEqual([{ codigo: 'A', linhas: [4, 9] }]);
  });

  it('ignora código provisório e trata a barra final como código diferente', () => {
    expect(
      findRepeatedCodes([
        { codigo: 'PLANILHA_L10', linha: 10 },
        { codigo: 'PLANILHA_L10', linha: 10 },
        { codigo: 'IMP/24/GLA10', linha: 11 },
        { codigo: 'IMP/24/GLA10/', linha: 12 },
      ])
    ).toEqual([]);
  });
});
