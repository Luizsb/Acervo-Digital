import { describe, expect, it } from 'vitest';
import { getResourceUrl, openResourceActionLabel, opensInsideAcervo } from './openResource';

describe('opensInsideAcervo', () => {
  const videoUrl = 'https://url.sae.digital/X';

  it('abre vídeo dentro do Acervo', () => {
    expect(opensInsideAcervo({ contentType: 'Audiovisual', macroformato: 'Vídeo', videoUrl })).toBe(true);
  });

  it('manda a playlist para nova guia, pelo macroformato ou pelo tipo de objeto', () => {
    expect(opensInsideAcervo({ contentType: 'Audiovisual', macroformato: 'Playlist', videoUrl })).toBe(false);
    expect(
      opensInsideAcervo({ contentType: 'Audiovisual', tipoObjeto: 'Playlist de vídeos', videoUrl })
    ).toBe(false);
  });

  it('não abre dentro o que não é audiovisual nem o que não tem link', () => {
    expect(opensInsideAcervo({ contentType: 'OED', macroformato: 'ODA', videoUrl })).toBe(false);
    expect(opensInsideAcervo({ contentType: 'Audiovisual', macroformato: 'Vídeo' })).toBe(false);
  });
});

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
