import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, ExternalLink, Search } from 'lucide-react';
import type { AuthUser } from '../contexts/AuthContext';
import { apiAdminReview, type AdminReviewItem, type ReviewGroup } from '../utils/api';
import { REVIEW_GROUP_LABELS, REVIEW_GROUP_ORDER } from '../utils/catalogVisibility';
import './AdminReviewPage.css';

interface AdminReviewPageProps {
  onBack: () => void;
  user?: AuthUser | null;
}

type FilterKey = 'todos' | ReviewGroup;

export function AdminReviewPage({ onBack, user }: AdminReviewPageProps) {
  const [items, setItems] = useState<AdminReviewItem[]>([]);
  const [counts, setCounts] = useState<Partial<Record<ReviewGroup, number>>>({});
  const [totalReview, setTotalReview] = useState(0);
  const [group, setGroup] = useState<FilterKey>('todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [group, search]);

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
          <h1>Fila de revisão</h1>
          <p>
            Visão da saúde do acervo: o que ainda não é público. Linhas da planilha sem título ou
            código também entram aqui quando o status do link não está funcionando.
          </p>
        </div>
      </section>

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
                      {item.status?.trim() || REVIEW_GROUP_LABELS[item.reviewGroup]}
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
    </div>
  );
}
