import { describe, expect, it } from 'vitest';
import { isVisibleInCatalog, reviewGroupFromStatus } from './catalogVisibility';

describe('isVisibleInCatalog', () => {
  it('libera só status Funcionando', () => {
    expect(isVisibleInCatalog('Funcionando')).toBe(true);
    expect(isVisibleInCatalog('funcionando')).toBe(true);
    expect(isVisibleInCatalog(' Funcionando ')).toBe(true);
  });

  it('esconde em branco e status de atenção', () => {
    expect(isVisibleInCatalog(null)).toBe(false);
    expect(isVisibleInCatalog('')).toBe(false);
    expect(isVisibleInCatalog('Acesso restrito')).toBe(false);
    expect(isVisibleInCatalog('Quebrado')).toBe(false);
    expect(isVisibleInCatalog('Incorreto')).toBe(false);
    expect(isVisibleInCatalog('Não avaliado')).toBe(false);
    expect(isVisibleInCatalog('Dúvida para revisão')).toBe(false);
  });

  it('classifica a fila de revisão', () => {
    expect(reviewGroupFromStatus(null)).toBe('em-cadastro');
    expect(reviewGroupFromStatus('Quebrado')).toBe('quebrado');
    expect(reviewGroupFromStatus('Incorreto')).toBe('incorreto');
    expect(reviewGroupFromStatus('Acesso restrito')).toBe('acesso-restrito');
    expect(reviewGroupFromStatus('Link quebrado')).toBe('quebrado');
    expect(reviewGroupFromStatus('Não avaliado')).toBe('nao-avaliado');
  });
});
