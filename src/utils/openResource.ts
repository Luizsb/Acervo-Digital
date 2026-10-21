import type { Project } from '../types/project';
import { resolveMacroformato, type MacroformatoKind } from './macroformato';

type ResourceProject = Pick<Project, 'videoUrl' | 'contentType' | 'macroformato' | 'tipoObjeto' | 'category'>;

const OPEN_LABEL_BY_KIND: Record<MacroformatoKind, string> = {
  video: 'Abrir vídeo',
  audio: 'Abrir áudio',
  playlist: 'Abrir playlist',
  interactive: 'Abrir atividade',
  sim: 'Abrir simulador',
  slide: 'Abrir slides',
  tool: 'Abrir ferramenta',
  support: 'Abrir material',
  ra: 'Abrir recurso',
  oda: 'Abrir ODA',
};

export function getResourceUrl(project: Pick<Project, 'videoUrl'>): string | undefined {
  const url = project.videoUrl?.trim();
  return url || undefined;
}

function resolveResourceKind(project: ResourceProject): MacroformatoKind | null {
  return (
    resolveMacroformato(project.macroformato)?.kind ??
    resolveMacroformato(project.tipoObjeto)?.kind ??
    resolveMacroformato(project.category)?.kind ??
    null
  );
}

/**
 * Recurso que abre dentro do Acervo (player e tela ampliada). A playlist fica de fora:
 * o link do SAE leva a uma playlist do YouTube, que recusa iframe, e o navegador não
 * consegue seguir o redirecionamento para converter em embed (o SAE bloqueia por CORS).
 */
export function opensInsideAcervo(project: ResourceProject): boolean {
  return (
    project.contentType === 'Audiovisual' &&
    Boolean(getResourceUrl(project)) &&
    resolveResourceKind(project) !== 'playlist'
  );
}

export function openResourceActionLabel(project: ResourceProject): string {
  const kind = resolveResourceKind(project);
  if (kind) return OPEN_LABEL_BY_KIND[kind];
  if (project.contentType === 'Audiovisual') return 'Abrir vídeo';
  return 'Abrir ODA';
}
