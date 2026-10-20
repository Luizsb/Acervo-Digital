import type { ODAFromExcel } from '../../types/project';
import { isVideoAulaCodigo, looksLikeAudiovisual } from '../contentType';
import { extractBnccCode, extractBnccDescription, formatDuration } from '../formatters';
import { brandFromCode } from '../thumbPaths';
import type { ODA } from './types';

function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

/** Converte o registro do banco (Express ou Supabase) no formato que a galeria usa. */
export function apiODAToFrontend(oda: ODA): ODAFromExcel {
  const bnccDescription = oda.bncc?.habilidade ?? undefined;
  const videoAula = isVideoAulaCodigo(oda.codigoOda);

  return {
    id: oda.id,
    codigoODA: oda.codigoOda || undefined,
    title: oda.titulo,
    tag: oda.componenteCurricular || '',
    tags: parseJsonArray(oda.tags),
    tagColor: oda.tagColor || 'bg-gray-600',
    location: oda.anoSerie || '',
    image: oda.imagem || '',
    videoUrl: oda.linkRepositorio || undefined,
    bnccCode: extractBnccCode(oda.codigoBncc) || undefined,
    bnccDescription:
      extractBnccDescription(oda.codigoBncc, oda.descricaoBncc || bnccDescription) || undefined,
    category: oda.categoria || oda.tipoObjeto || oda.macroformato || (videoAula ? 'Vídeo' : undefined),
    duration: formatDuration(oda.duracao || oda.tempoMedioEstimado) || undefined,
    volume: oda.volume || undefined,
    segmento: oda.segmento || undefined,
    pagina: oda.pagina || undefined,
    marca: oda.marca?.trim() || brandFromCode(oda.codigoOda) || undefined,
    contentType: looksLikeAudiovisual({
      macroformato: oda.macroformato,
      tipoPrincipal: oda.tipoObjeto || oda.categoria,
      codigoOda: oda.codigoOda,
    })
      ? 'Audiovisual'
      : oda.tipoConteudo,
    videoCategory: oda.categoriaVideo || undefined,
    samr: oda.escalaSamr || undefined,
    tipoObjeto: oda.tipoObjeto || oda.categoria || oda.macroformato || undefined,
    description: oda.descricao || undefined,
    learningObjectives: parseJsonArray(oda.objetivosAprendizagem),
    pedagogicalResources: parseJsonArray(oda.recursosPedagogicos),
    technicalRequirements: oda.requisitosTecnicos || undefined,
    metodologiaPdfUrl: oda.urlMetodologiaPdf || undefined,
    status: oda.status || undefined,
    colecao: oda.colecao || undefined,
    livro: oda.livro || undefined,
    envioEscola: oda.envioEscola || undefined,
    blocoCapitulo: oda.blocoCapitulo || undefined,
    anoProducao: oda.anoProducao || undefined,
    macroformato: oda.macroformato || (videoAula ? 'Vídeo' : undefined),
    palavrasChave: parseJsonArray(oda.palavrasChave),
    bnccCodeSecondary: extractBnccCode(oda.codigoBnccSecundaria) || undefined,
    bnccDescriptionSecondary:
      extractBnccDescription(oda.codigoBnccSecundaria, oda.descricaoBnccSecundaria) || undefined,
    tempoMedioEstimado: oda.tempoMedioEstimado || undefined,
    usuarioPrincipal: oda.usuarioPrincipal || undefined,
    ambienteUso: oda.ambienteUso || undefined,
    pageViewCount: oda.pageViewCount ?? 0,
    openViewCount: oda.openViewCount ?? 0,
  };
}
