import { LayoutGrid, List, SearchX, Sparkles } from 'lucide-react';
import type { Project } from '../types/project';
import { Pagination } from './Pagination';
import { ProjectGrid } from './ProjectGrid';

export type GalleryViewMode = 'grid' | 'list';

const RECOMMENDED_LIMIT = 8;

interface GalleryResultsProps {
  loading: boolean;
  /** Resultado da busca e dos filtros, inteiro. */
  results: Project[];
  /** Fatia da página atual de `results`. */
  pageResults: Project[];
  /** Sugestões quando nada é encontrado. */
  recommended: Project[];
  /** Mesmo tipo de conteúdo, para "ODAs Semelhantes" durante a busca. */
  sameContentType: Project[];
  searchQuery: string;
  hasActiveFilters: boolean;
  onClearSearchAndFilters: () => void;
  viewMode: GalleryViewMode;
  onViewModeChange: (mode: GalleryViewMode) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  favorites: number[];
  onProjectClick: (project: Project) => void;
  onToggleFavorite: (projectId: number) => void;
}

function ViewModeButton({
  active,
  onClick,
  title,
  label,
  Icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  label: string;
  Icon: typeof LayoutGrid;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
        active ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
      }`}
      title={title}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold hidden sm:inline">{label}</span>
    </button>
  );
}

export function GalleryResults({
  loading,
  results,
  pageResults,
  recommended,
  sameContentType,
  searchQuery,
  hasActiveFilters,
  onClearSearchAndFilters,
  viewMode,
  onViewModeChange,
  currentPage,
  totalPages,
  onPageChange,
  favorites,
  onProjectClick,
  onToggleFavorite,
}: GalleryResultsProps) {
  if (loading) {
    return (
      <div className="acervo-loading" role="status">
        <span className="acervo-loading-spinner" aria-hidden="true" />
        <p className="acervo-loading-title">Carregando acervo...</p>
        <p className="acervo-loading-hint">Buscando ODAs e videoaulas</p>
      </div>
    );
  }

  const isSearching = searchQuery.trim() !== '';
  const gridProps = { favorites, onProjectClick, onToggleFavorite };

  return (
    <div id="acervo-project-grid">
      <div className="mb-8 flex items-center justify-between">
        {results.length > 0 && (
          <>
            <p className="text-sm text-gray-500 font-semibold">
              {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <ViewModeButton
                active={viewMode === 'grid'}
                onClick={() => onViewModeChange('grid')}
                title="Visualização em grade"
                label="Grade"
                Icon={LayoutGrid}
              />
              <ViewModeButton
                active={viewMode === 'list'}
                onClick={() => onViewModeChange('list')}
                title="Visualização em lista"
                label="Lista"
                Icon={List}
              />
            </div>
          </>
        )}
      </div>

      <div className="mb-8">
        {results.length === 0 ? (
          <div>
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="relative mb-8">
                <div className="p-8 bg-gray-100 rounded-full">
                  <SearchX className="w-24 h-24 text-muted-foreground" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-12 h-12 text-secondary animate-pulse" />
                </div>
              </div>

              <h3 className="mb-3 text-foreground">Nenhum ODA encontrado</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                {isSearching
                  ? `Não encontramos resultados para "${searchQuery}". Tente ajustar sua busca ou explore as recomendações abaixo.`
                  : 'Não há ODAs que correspondam aos filtros selecionados. Tente remover alguns filtros ou explore as recomendações abaixo.'}
              </p>

              {(isSearching || hasActiveFilters) && (
                <button
                  onClick={onClearSearchAndFilters}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-[#013668] hover:shadow-md transition-all font-semibold flex items-center gap-2 shadow-sm text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Limpar e Explorar Tudo
                </button>
              )}
            </div>
            <div className="mt-12">
              <h3 className="text-primary mb-6 px-2">ODAs Recomendados</h3>
              <ProjectGrid projects={recommended.slice(0, RECOMMENDED_LIMIT)} {...gridProps} />
            </div>
          </div>
        ) : (
          <>
            <ProjectGrid projects={pageResults} viewMode={viewMode} {...gridProps} />

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
            )}

            {isSearching && (
              <div className="mt-12">
                <h3 className="text-primary mb-6 px-2">ODAs Semelhantes</h3>
                <ProjectGrid
                  projects={sameContentType
                    .filter((project) => !results.some((result) => result.id === project.id))
                    .slice(0, RECOMMENDED_LIMIT)}
                  viewMode={viewMode}
                  {...gridProps}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
