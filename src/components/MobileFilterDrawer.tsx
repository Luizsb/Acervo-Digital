import React from 'react';
import { X } from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  selectedFilters: any;
  onFilterChange: (category: string, value: string) => void;
  onClearFilters: () => void;
  contentType: 'Todos' | 'Audiovisual' | 'OED';
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  contentType
}: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="lg:hidden fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white z-50 shadow-2xl overflow-hidden flex flex-col">
        <div className="shrink-0 bg-primary z-10 px-4 py-4 flex items-center justify-between border-b-2 border-white/20">
          <h3 className="text-white font-extrabold text-sm">Filtros</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <FilterSidebar
            filters={filters}
            selectedFilters={selectedFilters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            contentType={contentType}
          />
        </div>
      </div>
    </>
  );
}
