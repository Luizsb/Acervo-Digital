import { describe, expect, it } from 'vitest';
import { isVideoAulaCodigo, looksLikeAudiovisual, resourceTypeLabel } from './contentType';

describe('looksLikeAudiovisual', () => {
  it('classifica Vídeo pelo macroformato', () => {
    expect(looksLikeAudiovisual({ macroformato: 'Vídeo' })).toBe(true);
  });

  it('classifica código SAE de vídeo-aula mesmo sem macroformato', () => {
    expect(
      looksLikeAudiovisual({
        macroformato: null,
        codigoOda: 'SAE25_AI14_CIE_C10_VA1',
      })
    ).toBe(true);
  });

  it('não classifica ODA interativa como audiovisual', () => {
    expect(
      looksLikeAudiovisual({
        macroformato: 'ODA',
        codigoOda: 'SAE26_AF71_ART_C03_OA1',
      })
    ).toBe(false);
  });

  it('reconhece sufixo _VA', () => {
    expect(isVideoAulaCodigo('SAE25_AI14_CIE_C12_VA1')).toBe(true);
    expect(isVideoAulaCodigo('EF22_9_EDF_L4_U4_01_OD1')).toBe(false);
  });
});

describe('resourceTypeLabel', () => {
  it('prefere Tipo principal e cai para Macroformato', () => {
    expect(
      resourceTypeLabel({ tipoObjeto: 'Quiz interativo', category: 'Quiz interativo', macroformato: 'ODA' })
    ).toBe('Quiz interativo');
    expect(resourceTypeLabel({ tipoObjeto: '', category: '', macroformato: 'Vídeo' })).toBe('Vídeo');
  });
});
