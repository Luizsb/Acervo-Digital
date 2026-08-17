import { describe, expect, it } from 'vitest';
import { hasResourceLink, isVisibleInCatalog, reviewGroupFromStatus } from './catalogVisibility';

const LINK = 'https://exemplo.com/recurso';

describe('isVisibleInCatalog', () => {
  it('libera status Funcionando com link', () => {
    expect(isVisibleInCatalog('Funcionando', LINK)).toBe(true);
    expect(isVisibleInCatalog('funcionando', LINK)).toBe(true);
    expect(isVisibleInCatalog(' Funcionando ', LINK)).toBe(true);
  });

  it('esconde em branco e status de atenção', () => {
    expect(isVisibleInCatalog(null, LINK)).toBe(false);
    expect(isVisibleInCatalog('', LINK)).toBe(false);
    expect(isVisibleInCatalog('Acesso restrito', LINK)).toBe(false);
    expect(isVisibleInCatalog('Quebrado', LINK)).toBe(false);
    expect(isVisibleInCatalog('Incorreto', LINK)).toBe(false);
    expect(isVisibleInCatalog('Não avaliado', LINK)).toBe(false);
    expect(isVisibleInCatalog('Dúvida para revisão', LINK)).toBe(false);
  });

  it('esconde Funcionando sem link do recurso', () => {
    expect(isVisibleInCatalog('Funcionando', null)).toBe(false);
    expect(isVisibleInCatalog('Funcionando', '')).toBe(false);
    expect(isVisibleInCatalog('Funcionando', '   ')).toBe(false);
  });

  it('classifica a fila de revisão', () => {
    expect(reviewGroupFromStatus(null)).toBe('em-cadastro');
    expect(reviewGroupFromStatus('Quebrado')).toBe('quebrado');
    expect(reviewGroupFromStatus('Incorreto')).toBe('incorreto');
    expect(reviewGroupFromStatus('Acesso restrito')).toBe('acesso-restrito');
    expect(reviewGroupFromStatus('Link quebrado')).toBe('quebrado');
    expect(reviewGroupFromStatus('Não avaliado')).toBe('nao-avaliado');
  });

  it('reconhece link preenchido', () => {
    expect(hasResourceLink(LINK)).toBe(true);
    expect(hasResourceLink(' ')).toBe(false);
    expect(hasResourceLink(null)).toBe(false);
  });
});
