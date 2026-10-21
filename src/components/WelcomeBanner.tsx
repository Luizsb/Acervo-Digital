import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Search, SlidersHorizontal, Sparkles } from 'lucide-react';

/** Apresentação do acervo no topo da galeria, recolhível. */
export function WelcomeBanner() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section id="acervo-hero" className="mb-10">
      <div
        className={`acervo-welcome-banner relative overflow-hidden rounded-2xl text-white shadow-lg ${
          collapsed ? 'acervo-welcome-banner--collapsed' : ''
        }`}
      >
        <button
          type="button"
          aria-label={collapsed ? 'Expandir apresentação do acervo' : 'Recolher apresentação do acervo'}
          title={collapsed ? 'Expandir apresentação' : 'Recolher apresentação'}
          onClick={() => setCollapsed((value) => !value)}
          className="acervo-welcome-close absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>

        {collapsed ? (
          <div className="acervo-welcome-collapsed relative z-10">
            <Sparkles className="h-4 w-4 shrink-0 text-secondary" />
            <span className="font-bold">Acervo pedagógico</span>
            <span className="acervo-welcome-collapsed-description hidden sm:inline">
              Encontre o recurso que você procura
            </span>
          </div>
        ) : (
          <div className="acervo-welcome-layout relative z-10">
            <div className="acervo-welcome-content max-w-3xl">
              <div className="acervo-welcome-badge mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em]">
                <Sparkles className="h-4 w-4 text-secondary" />
                Acervo pedagógico
              </div>
              <h1 className="mb-4 max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Encontre o recurso que você procura
              </h1>
              <p className="acervo-welcome-description max-w-2xl text-sm leading-relaxed sm:text-base lg:text-lg">
                Consulte objetos digitais e conteúdos audiovisuais organizados por etapa, componente curricular e BNCC.
              </p>
            </div>

            <div className="acervo-welcome-guide hidden rounded-2xl p-4 backdrop-blur-sm lg:block">
              <p className="acervo-welcome-guide-label mb-3 text-xs font-bold uppercase tracking-[0.12em]">
                Comece por aqui
              </p>
              <div className="acervo-welcome-guide-list">
                <div className="acervo-welcome-guide-row">
                  <Search className="h-5 w-5 shrink-0 text-secondary" />
                  <span className="acervo-welcome-guide-item text-sm font-semibold">Busque por tema ou palavra-chave</span>
                </div>
                <div className="acervo-welcome-guide-row">
                  <SlidersHorizontal className="h-5 w-5 shrink-0 text-secondary" />
                  <span className="acervo-welcome-guide-item text-sm font-semibold">Refine por currículo e localização editorial</span>
                </div>
                <div className="acervo-welcome-guide-row">
                  <BookOpen className="h-5 w-5 shrink-0 text-secondary" />
                  <span className="acervo-welcome-guide-item text-sm font-semibold">Consulte os detalhes de cada recurso</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
