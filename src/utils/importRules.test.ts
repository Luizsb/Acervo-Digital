import { describe, expect, it } from 'vitest';
import {
  createRepeatedCodeResolver,
  isImportableResource,
} from '../../server/lib/catalogVisibility';
import { findRepeatedCodes } from '../../server/lib/map-categorizacao';

describe('isImportableResource', () => {
  it('cadastra qualquer linha com código real, funcional ou não', () => {
    expect(isImportableResource({ codigoOda: 'EF21_8_MAT_L1_U1_01_OD1' })).toBe(true);
    expect(isImportableResource({ codigoOda: 'IMP/63/ALA19' })).toBe(true);
  });

  it('não cadastra linha sem código, que recebe código provisório', () => {
    expect(isImportableResource({ codigoOda: 'PLANILHA_L2316' })).toBe(false);
  });
});

describe('createRepeatedCodeResolver', () => {
  it('ignora a linha fora da galeria quando outra do mesmo código já entrou', () => {
    const accept = createRepeatedCodeResolver();
    expect(accept('A', true)).toBe(true);
    expect(accept('A', false)).toBe(false);
  });

  it('deixa a linha da galeria vencer uma anterior que não entra', () => {
    const accept = createRepeatedCodeResolver();
    expect(accept('A', false)).toBe(true);
    expect(accept('A', true)).toBe(true);
  });

  it('entre duas linhas do mesmo tipo, aceita as duas e a última vence', () => {
    const accept = createRepeatedCodeResolver();
    expect(accept('A', true)).toBe(true);
    expect(accept('A', true)).toBe(true);
    expect(accept('B', false)).toBe(true);
    expect(accept('B', false)).toBe(true);
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
