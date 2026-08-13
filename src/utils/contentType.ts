export function isVideoAulaCodigo(codigo?: string | null): boolean {
  return /_VA\d+/i.test(codigo || '');
}

export function looksLikeAudiovisual(params: {
  macroformato?: string | null;
  tipoPrincipal?: string | null;
  codigoOda?: string | null;
}): boolean {
  const text = `${params.macroformato || ''} ${params.tipoPrincipal || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (
    text.includes('video') ||
    text.includes('playlist') ||
    text.includes('audio') ||
    text.includes('podcast')
  ) {
    return true;
  }
  return isVideoAulaCodigo(params.codigoOda);
}

export function resourceTypeLabel(project: {
  tipoObjeto?: string | null;
  category?: string | null;
  macroformato?: string | null;
}): string {
  return (project.tipoObjeto || project.category || project.macroformato || '').trim();
}
