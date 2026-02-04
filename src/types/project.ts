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
}
