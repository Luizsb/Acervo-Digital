import type { ReviewGroup } from '../catalogVisibility';

export type { ReviewGroup };

export interface AuthUserResponse {
  id: number;
  email: string;
  name: string | null;
  role?: string;
}

export interface BNCC {
  id: number;
  codigo: string;
  habilidade?: string | null;
  descricao?: string | null;
  componente?: string | null;
  ano?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ODA {
  id: number;
  codigoOda?: string | null;
  titulo: string;
  componenteCurricular?: string | null;
  tags?: string | null;
  tagColor?: string | null;
  anoSerie?: string | null;
  imagem?: string | null;
  linkRepositorio?: string | null;
  codigoBncc?: string | null;
  descricaoBncc?: string | null;
  bncc?: BNCC | null;
  categoria?: string | null;
  duracao?: string | null;
  volume?: string | null;
  segmento?: string | null;
  pagina?: string | null;
  marca?: string | null;
  tipoConteudo: 'Audiovisual' | 'OED';
  categoriaVideo?: string | null;
  escalaSamr?: string | null;
  tipoObjeto?: string | null;
  descricao?: string | null;
  objetivosAprendizagem?: string | null;
  recursosPedagogicos?: string | null;
  requisitosTecnicos?: string | null;
  urlMetodologiaPdf?: string | null;
  status?: string | null;
  colecao?: string | null;
  livro?: string | null;
  envioEscola?: string | null;
  blocoCapitulo?: string | null;
  anoProducao?: string | null;
  macroformato?: string | null;
  palavrasChave?: string | null;
  codigoBnccSecundaria?: string | null;
  descricaoBnccSecundaria?: string | null;
  tempoMedioEstimado?: string | null;
  usuarioPrincipal?: string | null;
  ambienteUso?: string | null;
  ativo?: boolean;
  pageViewCount?: number;
  openViewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ODAResponse {
  data: ODA[];
  total: number;
  limit?: number | null;
  offset?: number | null;
}

export type OdaViewKind = 'page' | 'open';

export interface RecordOdaViewResponse {
  counted: boolean;
  pageViewCount: number;
  openViewCount: number;
}

export type ViewRankingPeriod = '7d' | '30d' | 'all';

export interface ViewRankingItem {
  id: number;
  codigoOda: string | null;
  titulo: string;
  count: number;
}

export interface ViewRankingResponse {
  kind: OdaViewKind;
  period: ViewRankingPeriod;
  limit: number;
  items: ViewRankingItem[];
}

export interface AdminReviewItem {
  id: number;
  titulo: string;
  codigoOda?: string | null;
  status?: string | null;
  tipoConteudo: string;
  tipoObjeto?: string | null;
  macroformato?: string | null;
  linkRepositorio?: string | null;
  marca?: string | null;
  anoSerie?: string | null;
  componenteCurricular?: string | null;
  reviewGroup: ReviewGroup;
  /** Só nos problemas da planilha (sem código, código repetido): a linha na planilha. */
  linha?: number | null;
  /** Só em código repetido: a linha que ficou valendo no banco. */
  vigente?: boolean | null;
}

export interface AdminUserItem {
  email: string;
  papel: string;
  criadoEm: string;
  ultimoAcesso: string | null;
}

export interface AdminReviewResponse {
  data: AdminReviewItem[];
  total: number;
  totalReview: number;
  counts: Record<ReviewGroup, number>;
}

export interface SpreadsheetImportSummary {
  processed: number;
  created: number;
  updated: number;
  unchanged: number;
  reactivated: number;
  deactivated: number;
  skipped: number;
  errors: number;
  totalActive: number;
  totalAudiovisual: number;
  totalOed: number;
  missingThumbsTotal: number;
  missingThumbsPublic: number;
  missingThumbs: { codigo: string; titulo: string; status: string | null }[];
}

export interface SpreadsheetJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  phase: 'reading' | 'importing' | 'finishing' | 'completed';
  current: number;
  total: number;
  percent: number;
  fileName: string;
  summary?: SpreadsheetImportSummary;
  error?: string;
}

export interface AsyncJobStartResponse {
  ok: boolean;
  jobId: string;
  message: string;
}

export interface MissingThumbItem {
  codigo: string | null;
  titulo: string;
  status: string | null;
  isPublic: boolean;
  hasLink: boolean;
}

export type SyncChangeKind = 'created' | 'updated' | 'reactivated' | 'deactivated';

export interface SyncChangeItem {
  codigo: string;
  titulo: string;
  kind: SyncChangeKind;
  imagem?: string | null;
  status?: string | null;
  syncedAt?: string | null;
}

export interface SpreadsheetStatusResponse {
  fileName: string;
  sizeBytes: number;
  modifiedAt: string;
  totalActive: number;
  missingThumbsTotal: number;
  missingThumbsPublic: number;
  missingThumbsWithoutLink: number;
  missingThumbsPublicWithoutLink: number;
  missingThumbs: MissingThumbItem[];
  googleSheets?: {
    configured: boolean;
    sheetId: string | null;
    hasServiceAccount: boolean;
    sourceLabel: string;
  };
  lastSync?: {
    at: string;
    source: 'upload' | 'google' | 'apps-script' | 'seed' | null;
    sourceLabel: string;
    fileName: string;
    created?: number;
    updated?: number;
    deactivated?: number;
    reactivated?: number;
    changes?: SyncChangeItem[];
  } | null;
  autoSyncEnabled?: boolean;
}

export interface ThumbCaptureJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  scope: 'public';
  current: number;
  total: number;
  percent: number;
  captured: number;
  skipped: number;
  failed: number;
  withoutLink: number;
  failures: { codigo: string; error: string }[];
  error?: string;
}
