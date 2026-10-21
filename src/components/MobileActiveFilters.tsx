import { X } from 'lucide-react';
import type { SelectedFilters } from '../hooks/useProjectFilters';

const DEFAULT_BADGE = 'bg-purple-100 text-purple-700 border-purple-300';

const BADGE_BY_CATEGORY: Partial<Record<keyof SelectedFilters, string>> = {
  anos: 'bg-blue-100 text-blue-700 border-blue-300',
  tags: 'bg-green-100 text-green-700 border-green-300',
  bnccCodes: 'bg-gray-100 text-gray-700 border-gray-300',
  segmentos: 'bg-orange-100 text-orange-700 border-orange-300',
  marcas: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  macroformatos: 'catalog-neutral',
  colecoes: 'bg-sky-100 text-sky-700 border-sky-300',
  livros: 'bg-violet-100 text-violet-700 border-violet-300',
  blocos: 'bg-lime-100 text-lime-800 border-lime-300',
  enviosEscola: 'bg-stone-100 text-stone-700 border-stone-300',
  usuariosPrincipais: 'bg-blue-100 text-blue-700 border-blue-300',
  palavrasChave: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  tipoObjeto: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
  videoCategory: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  samr: 'catalog-neutral',
  volumes: 'bg-rose-100 text-rose-700 border-rose-300',
  vestibular: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  capitulo: 'bg-teal-100 text-teal-700 border-teal-300',
};

export function countActiveFilters(selectedFilters: SelectedFilters): number {
  return Object.values(selectedFilters).reduce((total, values) => total + values.length, 0);
}

function filterLabel(category: string, value: string): string {
  return category === 'volumes' && /^\d+$/.test(value) ? `Vol. ${value}` : value;
}

/** Filtros ativos no topo da tela, só no celular (a barra lateral cobre o desktop). */
export function MobileActiveFilters({
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: {
  selectedFilters: SelectedFilters;
  onFilterChange: (category: string, value: string) => void;
  onClearFilters: () => void;
}) {
  const activeCount = countActiveFilters(selectedFilters);

  return (
    <div className="lg:hidden shrink-0 bg-white border-b border-gray-200 px-4 py-3">
      {activeCount > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Filtros ativos ({activeCount})</span>
            <button
              onClick={onClearFilters}
              className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors"
            >
              Limpar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(selectedFilters) as [keyof SelectedFilters, string[]][]).flatMap(
              ([category, values]) =>
                values.map((value) => (
                  <button
                    key={`${category}-${value}`}
                    onClick={() => onFilterChange(category, value)}
                    className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border-2 shadow-sm hover:shadow-md ${
                      BADGE_BY_CATEGORY[category] ?? DEFAULT_BADGE
                    }`}
                  >
                    <span className={category === 'bnccCodes' ? 'font-mono' : ''}>
                      {filterLabel(category, value)}
                    </span>
                    <X className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
