/**
 * Tipo de falha ao carregar o catálogo, para o aviso falar a língua de quem vê:
 * em produção é usuário final; no modo Express local, quem desenvolve.
 */
export type CatalogLoadErrorKind = 'backend-offline' | 'session' | 'unavailable' | 'paused';

function errorText(error: unknown): string {
  if (error == null) return '';
  if (typeof error !== 'object') return String(error);
  const record = error as {
    message?: unknown;
    code?: unknown;
    details?: unknown;
    status?: unknown;
  };
  return [record.message, record.code, record.details, record.status]
    .filter((part) => part != null && part !== '')
    .join(' ');
}

export function classifyCatalogLoadError(error: unknown): CatalogLoadErrorKind {
  const message = errorText(error);
  if (/project is paused|project paused|requested project is paused|inactivity|\b540\b/i.test(message)) {
    return 'paused';
  }
  if (
    message.includes('Failed to fetch') ||
    message.includes('ConnectionError') ||
    message.includes('ERR_CONNECTION_REFUSED') ||
    message.includes('NetworkError') ||
    ['TypeError', 'ConnectionError'].includes(String((error as { name?: unknown } | null)?.name))
  ) {
    return 'backend-offline';
  }
  if (/JWT expired|401|não autorizado/i.test(message)) return 'session';
  return 'unavailable';
}

export function catalogLoadMessage(
  kind: CatalogLoadErrorKind,
  isLocalBackend: boolean,
): { title: string; text: string } {
  if (kind === 'paused') {
    return {
      title: 'O banco do acervo está inativo',
      text: 'O banco está no plano gratuito e foi pausado por falta de uso. Avise o time de Interações Digitais para reativar. Depois, tente novamente.',
    };
  }
  if (kind === 'session') {
    return {
      title: 'Sua sessão expirou',
      text: 'Saia e entre novamente para continuar consultando o acervo.',
    };
  }
  if (kind === 'backend-offline') {
    if (isLocalBackend) {
      return {
        title: 'Não foi possível conectar ao acervo',
        text: 'A API local não respondeu.',
      };
    }
    return {
      title: 'Não foi possível falar com o banco',
      text: 'A conexão falhou. Isso acontece quando a internet cai ou quando o plano gratuito pausa o banco depois de alguns dias sem uso. Se a sua rede estiver funcionando, avise o time de Interações Digitais.',
    };
  }
  if (isLocalBackend) {
    return {
      title: 'Não foi possível carregar o acervo agora',
      text: 'Pode ser uma instabilidade passageira. Tente novamente em alguns segundos.',
    };
  }
  return {
    title: 'Não foi possível carregar o acervo agora',
    text: 'O banco devolveu um erro. Tente novamente em alguns segundos. Se continuar, avise o time de Interações Digitais.',
  };
}

/** Mensagem de login quando o banco não responde. Null quando o erro é de credencial. */
export function loginConnectionMessage(error: unknown, isLocalBackend: boolean): string | null {
  const kind = classifyCatalogLoadError(error);
  if (kind !== 'paused' && kind !== 'backend-offline') return null;
  if (isLocalBackend) {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando (npm run server:dev em outro terminal).';
  }
  return catalogLoadMessage(kind, false).text;
}
