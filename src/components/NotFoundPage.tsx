import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { BrandMark } from './BrandMark';
import './NotFoundPage.css';

interface NotFoundPageProps {
  /** Código pedido por um link de recurso (#/recurso/<codigo>) que não está no acervo. */
  missingResourceCode?: string | null;
  onGoToGallery: () => void;
}

export function NotFoundPage({ missingResourceCode, onGoToGallery }: NotFoundPageProps) {
  const isResource = Boolean(missingResourceCode);
  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <BrandMark className="not-found-brand" />
        <p className="not-found-code" aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title" className="not-found-title">
          {isResource ? 'Recurso não encontrado' : 'Página não encontrada'}
        </h1>
        <p className="not-found-text">
          {isResource
            ? 'Este recurso não existe ou não está mais disponível no acervo.'
            : 'O endereço que você abriu não existe ou foi alterado.'}
        </p>
        {isResource && <p className="not-found-resource">{missingResourceCode}</p>}
        <button type="button" className="not-found-action" onClick={onGoToGallery}>
          <ArrowLeft aria-hidden="true" />
          Ir para o acervo
        </button>
      </section>
    </main>
  );
}
