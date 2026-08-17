/**
 * Tipo centralizado para projetos (ODA / Audiovisual) no frontend.
 * Usado em galeria, detalhes, modal, favoritos e listagem.
 */
export interface Project {
  id: number;
  title: string;
  tag: string;
  tags?: string[];
  tagColor: string;
  location: string;
  image: string;
  /** URL do vídeo (Vimeo, etc.) quando contentType === 'Audiovisual' */
  videoUrl?: string;
  bnccCode?: string;
  bnccDescription?: string;
  category?: string;
  duration?: string;
  volume?: string;
  segmento?: string;
  pagina?: string;
  marca?: string;
  contentType?: string;
  videoCategory?: string;
  samr?: string;
  tipoObjeto?: string;
  description?: string;
  learningObjectives?: string[];
  pedagogicalResources?: string[];
  technicalRequirements?: string;
  metodologiaPdfUrl?: string;
  status?: string;
  codigoODA?: string;
  colecao?: string;
  livro?: string;
  envioEscola?: string;
  blocoCapitulo?: string;
  anoProducao?: string;
  macroformato?: string;
  palavrasChave?: string[];
  bnccCodeSecondary?: string;
  bnccDescriptionSecondary?: string;
  tempoMedioEstimado?: string;
  usuarioPrincipal?: string;
  ambienteUso?: string;
  vestibular?: string;
  capitulo?: string;
  enunciado?: string;
  nomeCapitulo?: string;
  pageViewCount?: number;
  openViewCount?: number;
}

/**
 * Nome mantido temporariamente para compatibilidade com o fluxo de dados L1.
 * Os registros agora vêm da API, não de uma planilha carregada pelo navegador.
 */
export type ODAFromExcel = Project & {
  contentType: 'Audiovisual' | 'OED';
};
