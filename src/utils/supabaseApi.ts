import { getSupabaseClient } from '../lib/supabaseClient';
import { hasCatalogStatus, hasResourceLink, reviewGroupFor, type ReviewGroup } from './catalogVisibility';
import type {
  AuthUserResponse,
  ODA,
  AdminReviewResponse,
  RecordOdaViewResponse,
  OdaViewKind,
  ViewRankingResponse,
  SpreadsheetStatusResponse,
  SyncChangeKind,
} from './api';

const LOCAL_JOB =
  'No Vercel isso roda na sua máquina: npm run import:categorizacao ou npm run thumbs:capture.';

function uuidToId(uuid: string): number {
  const hex = uuid.replace(/-/g, '').slice(0, 8);
  return Number.parseInt(hex, 16) % 2147483647;
}

function roleFromUser(user: { user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }): string {
  const meta = user.user_metadata?.role ?? user.app_metadata?.role;
  return meta === 'admin' ? 'admin' : 'user';
}

function throwIfError(error: { message?: string } | null, fallback: string): void {
  if (error) throw new Error(error.message || fallback);
}

function fromSnakeOda(row: Record<string, unknown>): ODA {
  return {
    id: Number(row.id),
    codigoOda: (row.codigo_oda as string) ?? null,
    titulo: String(row.titulo ?? ''),
    componenteCurricular: (row.componente_curricular as string) ?? null,
    tags: (row.tags as string) ?? null,
    tagColor: (row.tag_color as string) ?? null,
    anoSerie: (row.ano_serie as string) ?? null,
    imagem: (row.imagem as string) ?? null,
    linkRepositorio: (row.link_repositorio as string) ?? null,
    codigoBncc: (row.codigo_bncc as string) ?? null,
    descricaoBncc: (row.descricao_bncc as string) ?? null,
    categoria: (row.categoria as string) ?? null,
    duracao: (row.duracao as string) ?? null,
    volume: (row.volume as string) ?? null,
    segmento: (row.segmento as string) ?? null,
    pagina: (row.pagina as string) ?? null,
    marca: (row.marca as string) ?? null,
    tipoConteudo: String(row.tipo_conteudo ?? ''),
    categoriaVideo: (row.categoria_video as string) ?? null,
    escalaSamr: (row.escala_samr as string) ?? null,
    tipoObjeto: (row.tipo_objeto as string) ?? null,
    descricao: (row.descricao as string) ?? null,
    objetivosAprendizagem: (row.objetivos_aprendizagem as string) ?? null,
    recursosPedagogicos: (row.recursos_pedagogicos as string) ?? null,
    requisitosTecnicos: (row.requisitos_tecnicos as string) ?? null,
    urlMetodologiaPdf: (row.url_metodologia_pdf as string) ?? null,
    status: (row.status as string) ?? null,
    colecao: (row.colecao as string) ?? null,
    livro: (row.livro as string) ?? null,
    envioEscola: (row.envio_escola as string) ?? null,
    blocoCapitulo: (row.bloco_capitulo as string) ?? null,
    anoProducao: (row.ano_producao as string) ?? null,
    macroformato: (row.macroformato as string) ?? null,
    palavrasChave: (row.palavras_chave as string) ?? null,
    codigoBnccSecundaria: (row.codigo_bncc_secundaria as string) ?? null,
    descricaoBnccSecundaria: (row.descricao_bncc_secundaria as string) ?? null,
    tempoMedioEstimado: (row.tempo_medio_estimado as string) ?? null,
    usuarioPrincipal: (row.usuario_principal as string) ?? null,
    ambienteUso: (row.ambiente_uso as string) ?? null,
    ativo: row.ativo !== false,
    pageViewCount: Number(row.page_view_count ?? 0),
    openViewCount: Number(row.open_view_count ?? 0),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function toAuthUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}): AuthUserResponse {
  const name = user.user_metadata?.name;
  return {
    id: uuidToId(user.id),
    email: user.email || '',
    name: typeof name === 'string' ? name : null,
    role: roleFromUser(user),
  };
}

export async function supabaseLogin(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  throwIfError(error, 'E-mail ou senha incorretos.');
  if (!data.session || !data.user) throw new Error('E-mail ou senha incorretos.');
  return { token: data.session.access_token, user: toAuthUser(data.user) };
}

export async function supabaseAuthMe(): Promise<AuthUserResponse | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return toAuthUser(data.user);
}

export async function supabaseLogout(): Promise<void> {
  await getSupabaseClient().auth.signOut();
}

export async function supabaseFetchOdas(): Promise<ODA[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('odas').select('*').order('id', { ascending: true }).range(0, 2499);
  throwIfError(error, 'Erro ao carregar o catálogo.');
  return (data ?? []).map((row) => fromSnakeOda(row as Record<string, unknown>));
}

export async function supabaseFetchOdaById(id: number): Promise<ODA | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('odas').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? fromSnakeOda(data as Record<string, unknown>) : null;
}

export async function supabaseFavoritesGet(): Promise<number[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('auth_favorites').select('project_id');
  throwIfError(error, 'Erro ao carregar favoritos.');
  return (data ?? []).map((row) => Number(row.project_id));
}

export async function supabaseFavoriteAdd(projectId: number): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: sessionData } = await supabase.auth.getUser();
  if (!sessionData.user) throw new Error('Não autorizado.');
  const { error } = await supabase.from('auth_favorites').upsert({
    user_id: sessionData.user.id,
    project_id: projectId,
  });
  throwIfError(error, 'Erro ao adicionar favorito.');
}

export async function supabaseFavoriteRemove(projectId: number): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('auth_favorites').delete().eq('project_id', projectId);
  throwIfError(error, 'Erro ao remover favorito.');
}

export async function supabaseRecordOdaView(odaId: number, kind: OdaViewKind): Promise<RecordOdaViewResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('record_oda_view', { p_oda_id: odaId, p_kind: kind });
  throwIfError(error, 'Erro ao registrar visualização.');
  const result = data as RecordViewCount | null;
  return {
    counted: Boolean(result?.counted),
    pageViewCount: Number(result?.pageViewCount ?? 0),
    openViewCount: Number(result?.openViewCount ?? 0),
  };
}

type RecordViewCount = {
  counted?: boolean;
  pageViewCount?: number;
  openViewCount?: number;
};

export async function supabaseAdminReview(params?: {
  group?: string;
  search?: string;
}): Promise<AdminReviewResponse> {
  const odas = await supabaseFetchOdas();
  const reviewItems = odas
    .filter((oda) => oda.ativo !== false)
    .map((oda) => {
      const reviewGroup = reviewGroupFor({
        status: oda.status,
        linkRepositorio: oda.linkRepositorio,
      });
      return {
        id: oda.id,
        titulo: oda.titulo,
        codigoOda: oda.codigoOda,
        status: oda.status,
        tipoConteudo: oda.tipoConteudo,
        tipoObjeto: oda.tipoObjeto,
        componenteCurricular: oda.componenteCurricular,
        reviewGroup,
      };
    })
    .filter((item) => {
      const oda = odas.find((row) => row.id === item.id);
      return !hasCatalogStatus(oda?.status) || !hasResourceLink(oda?.linkRepositorio);
    });

  const search = params?.search?.trim().toLowerCase();
  const filtered = reviewItems.filter((item) => {
    if (params?.group && params.group !== 'todos' && item.reviewGroup !== params.group) return false;
    if (!search) return true;
    return [item.titulo, item.codigoOda, item.status].some((value) =>
      String(value || '').toLowerCase().includes(search)
    );
  });

  const counts = {
    'sem-link': 0,
    'em-cadastro': 0,
    quebrado: 0,
    incorreto: 0,
    'acesso-restrito': 0,
    'nao-avaliado': 0,
    duvida: 0,
    outro: 0,
  } as Record<ReviewGroup, number>;
  for (const item of reviewItems) counts[item.reviewGroup] += 1;

  return {
    data: filtered,
    total: filtered.length,
    totalReview: reviewItems.length,
    counts,
  };
}

export async function supabaseAdminViewsTop(params?: {
  kind?: OdaViewKind;
  period?: string;
  limit?: number;
}): Promise<ViewRankingResponse> {
  const kind = params?.kind ?? 'open';
  const limit = params?.limit ?? 20;
  const column = kind === 'page' ? 'page_view_count' : 'open_view_count';
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('odas')
    .select('id, codigo_oda, titulo, page_view_count, open_view_count')
    .order(column, { ascending: false })
    .limit(limit);
  throwIfError(error, 'Erro ao carregar o ranking de acessos.');
  return {
    kind,
    period: (params?.period as ViewRankingResponse['period']) ?? 'all',
    limit,
    items: (data ?? []).map((row) => ({
      id: Number(row.id),
      codigoOda: (row.codigo_oda as string) ?? null,
      titulo: String(row.titulo ?? ''),
      count: Number(kind === 'page' ? row.page_view_count : row.open_view_count),
    })),
  };
}

export async function supabaseSpreadsheetStatus(): Promise<SpreadsheetStatusResponse> {
  const supabase = getSupabaseClient();
  const odas = await supabaseFetchOdas();
  const active = odas.filter((oda) => oda.ativo !== false);
  const { data: latestRows, error: latestError } = await supabase
    .from('import_events')
    .select('synced_at')
    .order('synced_at', { ascending: false })
    .limit(1);
  throwIfError(latestError, 'Erro ao ler o histórico da planilha.');
  const latestRow = latestRows?.[0];

  let lastSync: SpreadsheetStatusResponse['lastSync'] = null;
  if (latestRow?.synced_at) {
    const { data: events, error: eventsError } = await supabase
      .from('import_events')
      .select('codigo, titulo, kind, imagem, status, synced_at')
      .eq('synced_at', latestRow.synced_at)
      .order('titulo', { ascending: true });
    throwIfError(eventsError, 'Erro ao ler as mudanças da planilha.');
    const changes = (events ?? []).map((row) => ({
      codigo: String(row.codigo),
      titulo: String(row.titulo),
      kind: row.kind as SyncChangeKind,
      imagem: (row.imagem as string | null) ?? `/thumbs/${row.codigo}.webp`,
      status: (row.status as string | null) ?? null,
      syncedAt: row.synced_at ? String(row.synced_at) : String(latestRow.synced_at),
    }));
    lastSync = {
      at: String(latestRow.synced_at),
      source: null,
      sourceLabel: 'importação local',
      fileName: 'Categorização_Recursos Digitais_Terceiros.xlsx',
      created: changes.filter((item) => item.kind === 'created').length,
      updated: changes.filter((item) => item.kind === 'updated').length,
      reactivated: changes.filter((item) => item.kind === 'reactivated').length,
      deactivated: changes.filter((item) => item.kind === 'deactivated').length,
      changes,
    };
  }

  return {
    fileName: 'importação local',
    sizeBytes: 0,
    modifiedAt: lastSync?.at || new Date().toISOString(),
    totalActive: active.length,
    missingThumbsTotal: 0,
    missingThumbsPublic: 0,
    missingThumbsWithoutLink: 0,
    missingThumbsPublicWithoutLink: 0,
    missingThumbs: [],
    lastSync,
    autoSyncEnabled: false,
  };
}

export function supabaseLocalJobOnly(): never {
  throw new Error(LOCAL_JOB);
}
