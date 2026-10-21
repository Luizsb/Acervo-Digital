import { useEffect, useState } from 'react';
import type { AuthUser } from '../contexts/AuthContext';
import type { ODAFromExcel } from '../types/project';
import { classifyCatalogLoadError, type CatalogLoadErrorKind } from '../utils/catalogLoadError';
import { loadODAsFromDatabase } from '../utils/loadODAs';

/** Catálogo da galeria. Só carrega com sessão: sem usuário, a lista fica vazia. */
export function useCatalog(user: AuthUser | null, authLoading: boolean) {
  const [projects, setProjects] = useState<ODAFromExcel[]>([]);
  const [fetching, setFetching] = useState(false);
  // Usuário para o qual o catálogo já respondeu. Logo após o login, o efeito ainda não
  // rodou; sem isto, haveria um render com "não está carregando" e lista vazia.
  const [settledFor, setSettledFor] = useState<AuthUser | null>(null);
  const [error, setError] = useState<CatalogLoadErrorKind | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProjects([]);
      setFetching(false);
      setSettledFor(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setFetching(true);
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
        if (cancelled) return;
        setFetching(false);
        setSettledFor(user);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reloadKey]);

  return {
    projects,
    loading: authLoading || fetching || (user !== null && settledFor !== user),
    error,
    retry: () => setReloadKey((key) => key + 1),
    dismissError: () => setError(null),
  };
}
