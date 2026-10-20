/**
 * Tipo de falha ao carregar o catálogo, para o aviso falar a língua de quem vê:
 * em produção é usuário final; no modo Express local, quem desenvolve.
 */
export type CatalogLoadErrorKind = 'backend-offline' | 'session' | 'unavailable';

export function classifyCatalogLoadError(error: unknown): CatalogLoadErrorKind {
  const message = String((error as { message?: unknown } | null)?.message ?? '');
  const name = (error as { name?: unknown } | null)?.name;
  if (
    message.includes('Failed to fetch') ||
    message.includes('ConnectionError') ||
    message.includes('ERR_CONNECTION_REFUSED') ||
    name === 'TypeError'
  ) {
    return 'backend-offline';
  }
  if (/JWT expired|401|não autorizado/i.test(message)) return 'session';
  return 'unavailable';
}
