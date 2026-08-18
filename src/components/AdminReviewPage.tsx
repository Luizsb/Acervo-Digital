import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  ExternalLink,
  FileImage,
  FileSpreadsheet,
  History,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react';
import type { AuthUser } from '../contexts/AuthContext';
import {
  apiAdminImportSpreadsheet,
  apiAdminReview,
  apiAdminSpreadsheetJob,
  apiAdminSpreadsheetStatus,
  apiAdminStartThumbCapture,
  apiAdminThumbJob,
  apiAdminViewsTop,
  type AdminReviewItem,
  type ReviewGroup,
  type SpreadsheetImportSummary,
  type SpreadsheetStatusResponse,
  type SyncChangeItem,
  type SyncChangeKind,
  type ThumbCaptureJob,
  type ViewRankingItem,
  type ViewRankingPeriod,
  type OdaViewKind,
} from '../utils/api';
import { REVIEW_GROUP_LABELS, REVIEW_GROUP_ORDER } from '../utils/catalogVisibility';
import './AdminReviewPage.css';

interface AdminReviewPageProps {
  onBack: () => void;
  user?: AuthUser | null;
}

type FilterKey = 'todos' | ReviewGroup;
type AdminTab = 'catalog' | 'history' | 'views';
type SyncLogTab = 'created' | 'updated';

const SYNC_CHANGE_LABELS: Record<SyncChangeKind, string> = {
  created: 'Novo',
  updated: 'Atualizado',
  reactivated: 'Reativado',
  deactivated: 'Desativado',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const VIEW_PERIOD_OPTIONS: { key: ViewRankingPeriod; label: string }[] = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'all', label: 'Total' },
];

const VIEW_KIND_OPTIONS: { key: OdaViewKind; label: string }[] = [
  { key: 'open', label: 'Abertura' },
  { key: 'page', label: 'Visita à página' },
];

function ChangeThumb({ codigo, imagem }: { codigo: string; imagem?: string | null }) {
  const [missing, setMissing] = useState(false);
  const src = imagem || `/thumbs/${codigo}.webp`;
  if (missing) {
    return (
      <span className="admin-sheet-change-thumb is-missing" title="Capa não está no deploy">
        sem capa
      </span>
    );
  }
  return (
    <img
      className="admin-sheet-change-thumb"
      src={src}
      alt=""
      onError={() => setMissing(true)}
    />
  );
}

function formatDate(value?: string): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return value;
  }
}

export function AdminReviewPage({ onBack, user }: AdminReviewPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('catalog');
  const [syncLogTab, setSyncLogTab] = useState<SyncLogTab>('created');
  const [items, setItems] = useState<AdminReviewItem[]>([]);
  const [counts, setCounts] = useState<Partial<Record<ReviewGroup, number>>>({});
  const [totalReview, setTotalReview] = useState(0);
  const [group, setGroup] = useState<FilterKey>('todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sheetStatus, setSheetStatus] = useState<SpreadsheetStatusResponse | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSummary, setImportSummary] = useState<SpreadsheetImportSummary | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importPhase, setImportPhase] = useState('');
  const [thumbJob, setThumbJob] = useState<ThumbCaptureJob | null>(null);
  const [thumbError, setThumbError] = useState('');
  const [checkingThumbs, setCheckingThumbs] = useState(false);
  const [thumbCheckMessage, setThumbCheckMessage] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [viewPeriod, setViewPeriod] = useState<ViewRankingPeriod>('30d');
  const [viewKind, setViewKind] = useState<OdaViewKind>('open');
  const [viewRanking, setViewRanking] = useState<ViewRankingItem[]>([]);
  const [viewRankingLoading, setViewRankingLoading] = useState(true);
  const [viewRankingError, setViewRankingError] = useState('');

  useEffect(() => {
    if (activeTab !== 'views') return;

    let cancelled = false;
    const loadStatus = async () => {
      try {
        const status = await apiAdminSpreadsheetStatus();
        if (!cancelled) setSheetStatus(status);
      } catch {
        if (!cancelled) setSheetStatus(null);
      }
    };
    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiAdminReview({
          group: group === 'todos' ? undefined : group,
          search: search.trim() || undefined,
        });
        if (cancelled) return;
        setItems(response.data);
        setCounts(response.counts);
        setTotalReview(response.totalReview);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Não foi possível carregar a fila.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const timer = window.setTimeout(() => void load(), 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [group, search, reloadKey]);

  useEffect(() => {
    let cancelled = false;
    const loadRanking = async () => {
      setViewRankingLoading(true);
      setViewRankingError('');
      try {
        const response = await apiAdminViewsTop({ kind: viewKind, period: viewPeriod, limit: 20 });
        if (!cancelled) setViewRanking(response.items);
      } catch (err: any) {
        if (!cancelled) {
          setViewRanking([]);
          setViewRankingError(err?.message || 'Não foi possível carregar o ranking.');
        }
      } finally {
        if (!cancelled) setViewRankingLoading(false);
      }
    };
    void loadRanking();
    return () => {
      cancelled = true;
    };
  }, [activeTab, viewKind, viewPeriod, reloadKey]);

  const filters = useMemo(
    () => [
      { key: 'todos' as const, label: 'Todos', count: totalReview },
      ...REVIEW_GROUP_ORDER.map((key) => ({
        key,
        label: REVIEW_GROUP_LABELS[key],
        count: counts[key] || 0,
      })),
    ],
    [counts, totalReview]
  );
  const missingThumbs = sheetStatus?.missingThumbs || [];
  const missingThumbsPublic = sheetStatus?.missingThumbsPublic ?? 0;
  const missingThumbsTotal = sheetStatus?.missingThumbsTotal ?? 0;
  const missingThumbsWithoutLink = sheetStatus?.missingThumbsWithoutLink ?? 0;
  const missingThumbsPublicWithoutLink = sheetStatus?.missingThumbsPublicWithoutLink ?? 0;
  const capturableThumbs = Math.max(
    0,
    missingThumbsPublic - missingThumbsPublicWithoutLink
  );
  const syncChanges = sheetStatus?.lastSync?.changes ?? [];
  const createdChanges = syncChanges.filter(
    (item) => item.kind === 'created' || item.kind === 'reactivated'
  );
  const updatedChanges = syncChanges.filter((item) => item.kind === 'updated');
  const visibleSyncChanges: SyncChangeItem[] =
    syncLogTab === 'created' ? createdChanges : updatedChanges;

  const handleThumbCheck = async () => {
    setCheckingThumbs(true);
    setThumbCheckMessage('');
    setThumbError('');
    try {
      const status = await apiAdminSpreadsheetStatus();
      setSheetStatus(status);
      setThumbCheckMessage(
        `Verificação concluída: ${status.missingThumbsTotal} sem capa no acervo; ${status.missingThumbsPublic} publicados.`
      );
    } catch (err: any) {
      setThumbError(err?.message || 'Falha ao verificar as capas do acervo.');
    } finally {
      setCheckingThumbs(false);
    }
  };

  const pollSpreadsheetJob = async (jobId: string) => {
    let finished = false;
    while (!finished) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      const job = await apiAdminSpreadsheetJob(jobId);
      setImportProgress(job.percent);
      setImportPhase(
        job.phase === 'reading'
          ? 'Lendo a planilha...'
          : job.phase === 'finishing'
            ? 'Finalizando e verificando as thumbs...'
            : `Sincronizando ${job.current} de ${job.total} linhas...`
      );
      if (job.status === 'failed') throw new Error(job.error || 'Falha na sincronização.');
      if (job.status === 'completed') {
        if (!job.summary) throw new Error('Sincronização concluída sem relatório.');
        setImportSummary(job.summary);
        finished = true;
      }
    }
    setReloadKey((value) => value + 1);
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    setSelectedFileName(file.name);
    setImporting(true);
    setImportError('');
    setImportSummary(null);
    setImportProgress(0);
    setImportPhase('Enviando a planilha...');
    try {
      const started = await apiAdminImportSpreadsheet(file);
      await pollSpreadsheetJob(started.jobId);
    } catch (err: any) {
      setImportError(err?.message || 'Falha ao sincronizar a planilha.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleThumbCapture = async () => {
    setThumbError('');
    setThumbJob({
      id: '',
      status: 'processing',
      scope: 'public',
      current: 0,
      total: 0,
      percent: 0,
      captured: 0,
      skipped: 0,
      failed: 0,
      withoutLink: 0,
      failures: [],
    });
    try {
      const started = await apiAdminStartThumbCapture();
      let finished = false;
      while (!finished) {
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
        const job = await apiAdminThumbJob(started.jobId);
        setThumbJob(job);
        if (job.status === 'failed') throw new Error(job.error || 'Falha na captura de thumbs.');
        if (job.status === 'completed') {
          finished = true;
          setReloadKey((value) => value + 1);
        }
      }
    } catch (err: any) {
      setThumbError(err?.message || 'Falha na captura de thumbs.');
      setThumbJob(null);
    }
  };

  return (
    <div className="admin-review">
      <header className="admin-review-top">
        <button type="button" className="admin-review-back" onClick={onBack}>
          <ArrowLeft size={16} />
          Voltar ao acervo
        </button>
        <p className="admin-review-user">{user?.name || 'Admin Demo'}</p>
      </header>

      <section className="admin-review-hero">
        <div className="admin-review-hero-icon" aria-hidden="true">
          <ClipboardList size={22} />
        </div>
        <div>
          <h1>Administração</h1>
          <p>
            {activeTab === 'catalog'
              ? 'Sincronize a planilha e acompanhe o status dos itens e das capas.'
              : activeTab === 'history'
                ? 'Veja o que entrou novo e o que mudou na última importação, com capa e horário.'
                : 'Acompanhe quais recursos são visitados e abertos pelos usuários.'}
          </p>
        </div>
      </section>

      <nav className="admin-tabs" aria-label="Seções da administração">
        <button
          type="button"
          className={activeTab === 'catalog' ? 'is-active' : ''}
          aria-current={activeTab === 'catalog' ? 'page' : undefined}
          onClick={() => setActiveTab('catalog')}
        >
          <ClipboardList size={17} />
          Status dos itens e capas
        </button>
        <button
          type="button"
          className={activeTab === 'history' ? 'is-active' : ''}
          aria-current={activeTab === 'history' ? 'page' : undefined}
          onClick={() => setActiveTab('history')}
        >
          <History size={17} />
          Novos e atualizados
        </button>
        <button
          type="button"
          className={activeTab === 'views' ? 'is-active' : ''}
          aria-current={activeTab === 'views' ? 'page' : undefined}
          onClick={() => setActiveTab('views')}
        >
          <BarChart3 size={17} />
          Acessos e visualizações
        </button>
      </nav>

      {activeTab === 'catalog' ? (
        <>
      <section className="admin-sheet-card">
        <div className="admin-sheet-head">
          <div className="admin-sheet-title">
            <FileSpreadsheet size={18} />
            <div>
              <h2>Planilha do catálogo</h2>
              <p>
                {sheetStatus
                  ? `${sheetStatus.fileName} · ${formatBytes(sheetStatus.sizeBytes)} · ${sheetStatus.totalActive} ativos no banco`
                  : 'Carregando status da planilha...'}
              </p>
            </div>
          </div>
          <div className="admin-sheet-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              hidden
              onChange={(event) => void handleImport(event.target.files?.[0] || null)}
            />
            <button
              type="button"
              className="admin-sheet-upload is-ghost"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              {importing ? 'Sincronizando...' : 'Enviar arquivo'}
            </button>
          </div>
        </div>
        <dl className="admin-sheet-meta">
          <div>
            <dt>Última sincronização</dt>
            <dd>
              {sheetStatus?.lastSync
                ? `${formatDate(sheetStatus.lastSync.at)} · ${sheetStatus.lastSync.sourceLabel}`
                : 'Nenhuma sincronização registrada nesta instância'}
            </dd>
          </div>
          <div>
            <dt>Arquivo em disco</dt>
            <dd>{sheetStatus ? formatDate(sheetStatus.modifiedAt) : '—'}</dd>
          </div>
          <div>
            <dt>Recebimento automático</dt>
            <dd>
              {sheetStatus?.autoSyncEnabled
                ? 'Habilitado (token configurado)'
                : 'Desabilitado — defina SPREADSHEET_SYNC_TOKEN'}
            </dd>
          </div>
        </dl>
        {selectedFileName ? (
          <p className="admin-sheet-file">Arquivo selecionado: {selectedFileName}</p>
        ) : null}
        {importing ? (
          <div className="admin-progress" aria-live="polite">
            <div className="admin-progress-label">
              <span>{importPhase}</span>
              <strong>{importProgress}%</strong>
            </div>
            <div
              className="admin-progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={importProgress}
            >
              <span style={{ width: `${importProgress}%` }} />
            </div>
          </div>
        ) : null}
        {importError ? <p className="admin-review-error">{importError}</p> : null}
        {importSummary ? (
          <div className="admin-sheet-summary">
            <div className="admin-sheet-stat">
              <strong>{importSummary.created}</strong>
              <span>Novos</span>
            </div>
            <div className="admin-sheet-stat">
              <strong>{importSummary.updated}</strong>
              <span>Atualizados</span>
            </div>
            <div className="admin-sheet-stat">
              <strong>{importSummary.unchanged}</strong>
              <span>Sem alteração</span>
            </div>
            <div className="admin-sheet-stat">
              <strong>{importSummary.reactivated}</strong>
              <span>Reativados</span>
            </div>
            <div className="admin-sheet-stat">
              <strong>{importSummary.deactivated}</strong>
              <span>Desativados</span>
            </div>
            <div className="admin-sheet-stat">
              <strong>{importSummary.skipped}</strong>
              <span>Linhas ignoradas</span>
            </div>
            <div className="admin-sheet-stat">
              <strong>{importSummary.totalActive}</strong>
              <span>Ativos no banco</span>
            </div>
          </div>
        ) : null}
      </section>

      <section className="admin-sheet-card">
        <div className="admin-sheet-head">
          <div className="admin-sheet-title">
            <FileImage size={18} />
            <div>
              <h2>Capas dos recursos</h2>
              <p>
                {sheetStatus
                  ? `${missingThumbsTotal} sem capa · ${capturableThumbs} elegíveis para captura automática`
                  : 'Carregando auditoria de capas...'}
              </p>
            </div>
          </div>
          <div className="admin-sheet-actions">
            <button
              type="button"
              className="admin-sheet-capture is-primary"
              disabled={thumbJob?.status === 'processing' || capturableThumbs === 0 || importing}
              onClick={() => void handleThumbCapture()}
            >
              <FileImage size={16} />
              {thumbJob?.status === 'processing'
                ? 'Capturando...'
                : `Capturar elegíveis (${capturableThumbs})`}
            </button>
            <button
              type="button"
              className="admin-sheet-check"
              disabled={checkingThumbs || importing}
              onClick={() => void handleThumbCheck()}
            >
              <RefreshCw size={16} className={checkingThumbs ? 'is-spinning' : ''} />
              {checkingThumbs ? 'Verificando...' : 'Verificar capas'}
            </button>
          </div>
        </div>
        {thumbCheckMessage ? (
          <p className="admin-sheet-check-result">{thumbCheckMessage}</p>
        ) : null}
        {thumbJob ? (
          <div className="admin-progress" aria-live="polite">
            <div className="admin-progress-label">
              <span>
                {thumbJob.status === 'completed'
                  ? `${thumbJob.captured} capturadas · ${thumbJob.failed} falhas · ${thumbJob.withoutLink} sem link`
                  : `${thumbJob.current} de ${thumbJob.total || '...'} · ${thumbJob.captured} capturadas`}
              </span>
              <strong>{thumbJob.percent}%</strong>
            </div>
            <div className="admin-progress-track">
              <span style={{ width: `${thumbJob.percent}%` }} />
            </div>
          </div>
        ) : null}
        {thumbJob?.failures.length ? (
          <div className="admin-thumb-failures">
            <strong>Não foi possível capturar:</strong>
            <ul>
              {thumbJob.failures.map((failure) => (
                <li key={failure.codigo}>
                  <code>{failure.codigo}</code>
                  <span>{failure.error}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {thumbError ? <p className="admin-review-error">{thumbError}</p> : null}
        {missingThumbs.length ? (
          <div className="admin-sheet-missing">
            <div className="admin-sheet-missing-head">
              <div>
                <h3>Capas ausentes ({missingThumbsTotal})</h3>
                <p>
                  A auditoria revisa todo o acervo: <strong>{missingThumbsPublic}</strong> publicados
                  e <strong>{missingThumbsTotal - missingThumbsPublic}</strong> na fila de revisão.
                  A captura automática considera somente os <strong>{capturableThumbs}</strong> com
                  cadastro completo, status Funcionando e link do recurso.
                  {missingThumbsPublicWithoutLink > 0
                    ? ` ${missingThumbsPublicWithoutLink} publicado está sem link e precisa de ajuste na planilha.`
                    : ''}
                  {missingThumbsWithoutLink > missingThumbsPublicWithoutLink
                    ? ` Outros ${missingThumbsWithoutLink - missingThumbsPublicWithoutLink} itens da revisão também estão sem link.`
                    : ''}
                </p>
              </div>
            </div>
            <ul>
              {missingThumbs.map((item) => (
                <li key={item.codigo || item.titulo}>
                  <code>{item.codigo || '—'}</code>
                  <span>
                    {item.titulo}
                    <em className={item.isPublic ? 'is-public' : ''}>
                      {item.isPublic ? 'publicado' : item.status?.trim() || 'em cadastro'}
                      {item.hasLink ? '' : ' · sem link'}
                    </em>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

        </>
      ) : null}

      {activeTab === 'history' ? (
        <section className="admin-sheet-card">
          <div className="admin-sheet-changes-head">
            <h3>Histórico da última importação</h3>
            <p>
              {sheetStatus?.lastSync
                ? `${formatDate(sheetStatus.lastSync.at)} · ${
                    [
                      sheetStatus.lastSync.created ? `${sheetStatus.lastSync.created} novos` : null,
                      sheetStatus.lastSync.updated
                        ? `${sheetStatus.lastSync.updated} atualizados`
                        : null,
                      sheetStatus.lastSync.reactivated
                        ? `${sheetStatus.lastSync.reactivated} reativados`
                        : null,
                      sheetStatus.lastSync.deactivated
                        ? `${sheetStatus.lastSync.deactivated} desativados`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'sem alterações nesta sincronização'
                  }`
                : 'Ainda não há log. Na sua máquina: npm run import:categorizacao — a lista aparece na próxima importação que criar ou alterar recurso.'}
            </p>
          </div>
          <div className="admin-sheet-log-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={syncLogTab === 'created'}
              className={syncLogTab === 'created' ? 'is-active' : ''}
              onClick={() => setSyncLogTab('created')}
            >
              Novos ({createdChanges.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={syncLogTab === 'updated'}
              className={syncLogTab === 'updated' ? 'is-active' : ''}
              onClick={() => setSyncLogTab('updated')}
            >
              Atualizados ({updatedChanges.length})
            </button>
          </div>
          {visibleSyncChanges.length ? (
            <ul className="admin-sheet-log-list">
              {visibleSyncChanges.map((change) => (
                <li key={`${change.kind}-${change.codigo}`}>
                  <ChangeThumb codigo={change.codigo} imagem={change.imagem} />
                  <div className="admin-sheet-change-body">
                    <div className="admin-sheet-change-row">
                      <span className={`admin-sheet-change-tag is-${change.kind}`}>
                        {SYNC_CHANGE_LABELS[change.kind]}
                      </span>
                      <code>{change.codigo}</code>
                      <time dateTime={change.syncedAt || sheetStatus?.lastSync?.at || undefined}>
                        {formatDate(change.syncedAt || sheetStatus?.lastSync?.at)}
                      </time>
                    </div>
                    <span className="admin-sheet-change-title">{change.titulo}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-sheet-log-empty">
              {syncLogTab === 'created'
                ? 'Nenhum cadastro novo nesta sincronização.'
                : 'Nenhum recurso atualizado nesta sincronização.'}
            </p>
          )}
        </section>
      ) : null}

      {activeTab === 'views' ? (
      <section className="admin-sheet-card">
        <div className="admin-sheet-head">
          <div className="admin-sheet-title">
            <BarChart3 size={18} />
            <div>
              <h2>Recursos mais acessados</h2>
              <p>
                {viewKind === 'open'
                  ? 'Aberturas reais do recurso (tela ampliada), 1 por pessoa por dia'
                  : 'Visitas à ficha do recurso, 1 por pessoa por dia'}
              </p>
            </div>
          </div>
        </div>
        <div className="admin-views-filters">
          <div className="admin-review-filters">
            {VIEW_KIND_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`admin-review-chip${viewKind === option.key ? ' is-active' : ''}`}
                onClick={() => setViewKind(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="admin-review-filters">
            {VIEW_PERIOD_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`admin-review-chip${viewPeriod === option.key ? ' is-active' : ''}`}
                onClick={() => setViewPeriod(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {viewRankingError ? <p className="admin-review-error">{viewRankingError}</p> : null}
        {viewRankingLoading ? (
          <p className="admin-views-empty">Carregando ranking...</p>
        ) : viewRanking.length === 0 ? (
          <p className="admin-views-empty">Ainda não há acessos registrados neste recorte.</p>
        ) : (
          <ol className="admin-views-list">
            {viewRanking.map((item, index) => (
              <li key={item.id}>
                <span className="admin-views-rank">{index + 1}</span>
                <code>{item.codigoOda || '—'}</code>
                <span className="admin-views-title">{item.titulo}</span>
                <strong>{item.count.toLocaleString('pt-BR')}</strong>
              </li>
            ))}
          </ol>
        )}
      </section>
      ) : null}

      {activeTab === 'catalog' ? (
        <>
      <div className="admin-review-toolbar">
        <div className="admin-review-search">
          <Search size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, código ou status"
          />
        </div>
        <div className="admin-review-filters">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-review-chip${group === item.key ? ' is-active' : ''}${
                item.key === 'quebrado' || item.key === 'incorreto' || item.key === 'acesso-restrito'
                  ? ' is-alert'
                  : ''
              }`}
              onClick={() => setGroup(item.key)}
            >
              {item.label}
              <span>{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="admin-review-error">{error}</p> : null}

      <div className="admin-review-table-wrap">
        <table className="admin-review-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Nome</th>
              <th>Código</th>
              <th>Tipo</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Carregando fila...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5}>Nenhum recurso neste filtro.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={`admin-review-status is-${item.reviewGroup}`}>
                      {item.reviewGroup === 'sem-link'
                        ? REVIEW_GROUP_LABELS['sem-link']
                        : item.status?.trim() || REVIEW_GROUP_LABELS[item.reviewGroup]}
                    </span>
                  </td>
                  <td>
                    <strong>{item.titulo}</strong>
                    <span className="admin-review-meta">
                      {[item.componenteCurricular, item.anoSerie, item.marca].filter(Boolean).join(' · ')}
                    </span>
                  </td>
                  <td className="admin-review-code">{item.codigoOda || '—'}</td>
                  <td>{item.tipoObjeto || item.macroformato || item.tipoConteudo}</td>
                  <td>
                    {item.linkRepositorio ? (
                      <a href={item.linkRepositorio} target="_blank" rel="noopener noreferrer">
                        Abrir link
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      'Sem link'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </>
      ) : null}
    </div>
  );
}
