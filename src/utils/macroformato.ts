export type MacroformatoKind =
  | 'video'
  | 'oda'
  | 'interactive'
  | 'sim'
  | 'playlist'
  | 'audio'
  | 'ra'
  | 'slide'
  | 'tool'
  | 'support';

export type MacroformatoMeta = {
  kind: MacroformatoKind;
  label: string;
  className: string;
};

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function resolveMacroformato(value?: string | null): MacroformatoMeta | null {
  if (!value) return null;
  const key = normalize(value);
  if (!key) return null;

  if (key.includes('video')) {
    return { kind: 'video', label: value.trim(), className: 'catalog-macro catalog-macro-video' };
  }
  if (key.includes('playlist')) {
    return { kind: 'playlist', label: value.trim(), className: 'catalog-macro catalog-macro-playlist' };
  }
  if (key.includes('pagina interativa') || key.includes('interativ')) {
    return { kind: 'interactive', label: value.trim(), className: 'catalog-macro catalog-macro-interactive' };
  }
  if (key.includes('simulador')) {
    return { kind: 'sim', label: value.trim(), className: 'catalog-macro catalog-macro-sim' };
  }
  if (key.includes('audio') || key.includes('podcast')) {
    return { kind: 'audio', label: value.trim(), className: 'catalog-macro catalog-macro-audio' };
  }
  if (key === 'ra' || key.includes('realidade aumentada') || key.includes('realidade virtual')) {
    return { kind: 'ra', label: value.trim(), className: 'catalog-macro catalog-macro-ra' };
  }
  if (key.includes('slide')) {
    return { kind: 'slide', label: value.trim(), className: 'catalog-macro catalog-macro-slide' };
  }
  if (key.includes('ferramenta')) {
    return { kind: 'tool', label: value.trim(), className: 'catalog-macro catalog-macro-tool' };
  }
  if (key.includes('material') || key.includes('apoio')) {
    return { kind: 'support', label: value.trim(), className: 'catalog-macro catalog-macro-support' };
  }
  if (key === 'oda' || key.includes('objeto digital')) {
    return { kind: 'oda', label: value.trim(), className: 'catalog-macro catalog-macro-oda' };
  }

  return { kind: 'oda', label: value.trim(), className: 'catalog-macro catalog-macro-oda' };
}

export function isVideoMacroformato(value?: string | null): boolean {
  return resolveMacroformato(value)?.kind === 'video';
}
