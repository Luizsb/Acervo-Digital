import { describe, expect, it } from 'vitest';
import { getResourceUrl, openResourceActionLabel } from './openResource';

describe('getResourceUrl', () => {
  it('devolve o link do repositório quando existe', () => {
    expect(getResourceUrl({ videoUrl: 'https://player.vimeo.com/video/123' })).toBe(
      'https://player.vimeo.com/video/123'
    );
  });

  it('ignora URL vazia', () => {
    expect(getResourceUrl({ videoUrl: '  ' })).toBeUndefined();
    expect(getResourceUrl({})).toBeUndefined();
  });
});

describe('openResourceActionLabel', () => {
  it('usa vídeo quando o macroformato é vídeo', () => {
    expect(openResourceActionLabel({ macroformato: 'Vídeo', contentType: 'Audiovisual' })).toBe(
      'Abrir vídeo'
    );
  });

  it('usa áudio pelo tipo principal mesmo sem macroformato', () => {
    expect(
      openResourceActionLabel({
        tipoObjeto: 'Áudio de pronúncia',
        contentType: 'Audiovisual',
      })
    ).toBe('Abrir áudio');
  });

  it('usa ODA para objeto digital', () => {
    expect(openResourceActionLabel({ macroformato: 'ODA', contentType: 'OED' })).toBe('Abrir ODA');
  });

  it('cai para Abrir vídeo em audiovisual sem classificação', () => {
    expect(openResourceActionLabel({ contentType: 'Audiovisual' })).toBe('Abrir vídeo');
  });
});
