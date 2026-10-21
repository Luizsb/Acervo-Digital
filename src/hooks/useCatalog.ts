import { useEffect, useState } from 'react';
import type { AuthUser } from '../contexts/AuthContext';
import type { ODAFromExcel } from '../types/project';
import { classifyCatalogLoadError, type CatalogLoadErrorKind } from '../utils/catalogLoadError';
import { loadODAsFromDatabase } from '../utils/loadODAs';

/** Catálogo da galeria. Só carrega com sessão: sem usuário, a lista fica vazia. */
export function useCatalog(user: AuthUser | null, authLoading: boolean) {
  const [projects, setProjects] = useState<ODAFromExcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CatalogLoadErrorKind | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProjects([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    loadODAsFromDatabase()
      .then((odas) => {
        if (!cancelled) setProjects(odas);
      })
      .catch((err: unknown) => {
        console.error('Erro ao carregar ODAs do banco de dados:', err);
        if (cancelled) return;
        setProjects([]);
        setError(classifyCatalogLoadError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reloadKey]);

  return {
    projects,
    loading,
    error,
    retry: () => setReloadKey((key) => key + 1),
    dismissError: () => setError(null),
  };
}
