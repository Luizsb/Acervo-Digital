import { describe, expect, it } from 'vitest';
import { apiODAToFrontend } from './odaToProject';
import type { ODA } from './types';

function oda(overrides: Partial<ODA> = {}): ODA {
  return {
    id: 1,
    titulo: 'Recurso',
    tipoConteudo: 'OED',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('apiODAToFrontend', () => {
  it('usa a marca da planilha e, sem ela, deduz Conquista pelo prefixo IMP/', () => {
    expect(apiODAToFrontend(oda({ marca: ' SAE Digital ', codigoOda: 'IMP/1/A' })).marca).toBe(
      'SAE Digital'
    );
    expect(apiODAToFrontend(oda({ marca: null, codigoOda: 'IMP/24/GLA10' })).marca).toBe('Conquista');
    expect(apiODAToFrontend(oda({ marca: '', codigoOda: 'SAE25_X' })).marca).toBeUndefined();
  });

  it('lê listas em JSON e ignora texto inválido', () => {
    const project = apiODAToFrontend(
      oda({ tags: '["a", 2, "b"]', palavrasChave: 'não é json', objetivosAprendizagem: null })
    );
    expect(project.tags).toEqual(['a', 'b']);
    expect(project.palavrasChave).toEqual([]);
    expect(project.learningObjectives).toEqual([]);
  });

  it('trata código de videoaula como vídeo quando falta macroformato', () => {
    const project = apiODAToFrontend(oda({ codigoOda: 'EF21_6_MAT_VA01' }));
    expect(project.macroformato).toBe('Vídeo');
    expect(project.category).toBe('Vídeo');
  });

  it('mantém os contadores de visualização em zero quando ausentes', () => {
    const project = apiODAToFrontend(oda());
    expect(project.pageViewCount).toBe(0);
    expect(project.openViewCount).toBe(0);
  });
});
