import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { catalogLoadMessage, type CatalogLoadErrorKind } from '../utils/catalogLoadError';
import './CatalogLoadError.css';

interface CatalogLoadErrorProps {
  kind: CatalogLoadErrorKind;
  /** Modo Express local: o aviso traz os comandos de desenvolvimento. */
  isLocalBackend: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}

export function CatalogLoadError({ kind, isLocalBackend, onRetry, onDismiss }: CatalogLoadErrorProps) {
  const { title, text } = catalogLoadMessage(kind, isLocalBackend);
  return (
    <div className="catalog-load-error" role="alert">
      <AlertTriangle className="catalog-load-error-icon" aria-hidden="true" />
      <div className="catalog-load-error-body">
        <p className="catalog-load-error-title">{title}</p>
        <p className="catalog-load-error-text">{text}</p>
        {isLocalBackend && kind !== 'session' && (
          <p className="catalog-load-error-dev">
            Ambiente local: confira se a API está rodando (<code>npm run server:dev</code>) e se o
            banco está atualizado (<code>npm run prisma:migrate</code>).
          </p>
        )}
        <button type="button" className="catalog-load-error-retry" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Tentar novamente
        </button>
      </div>
      <button
        type="button"
        className="catalog-load-error-close"
        onClick={onDismiss}
        aria-label="Fechar aviso"
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
