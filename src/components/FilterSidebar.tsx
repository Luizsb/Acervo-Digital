import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    anos: string[];
    tags: string[];
    bnccCodes: string[];
    livros: string[];
    categorias: string[];
    marcas: string[];
    tipoObjeto: string[];
    videoCategory: string[];
    samr: string[];
    volumes: string[];
  };
  selectedFilters: {
    anos: string[];
    tags: string[];
    bnccCodes: string[];
    livros: string[];
    categorias: string[];
    marcas: string[];
    tipoObjeto: string[];
    videoCategory: string[];
    samr: string[];
    volumes: string[];
  };
  onFilterChange: (category: string, value: string) => void;
  onClearFilters: () => void;
  contentType: 'Todos' | 'Audiovisual' | 'OED';
}

export function FilterSidebar({ filters, selectedFilters, onFilterChange, onClearFilters, contentType }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    anos: false,
    tags: false,
    bncc: false,
    livros: false,
    categorias: false,
    marcas: false,
    tipoObjeto: false,
    videoCategory: false,
    samr: false,
    volumes: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = 
    selectedFilters.anos.length > 0 ||
    selectedFilters.tags.length > 0 ||
    selectedFilters.bnccCodes.length > 0 ||
    selectedFilters.livros.length > 0 ||
    selectedFilters.categorias.length > 0 ||
    selectedFilters.marcas.length > 0 ||
    selectedFilters.tipoObjeto.length > 0 ||
    selectedFilters.videoCategory.length > 0 ||
    selectedFilters.samr.length > 0 ||
    selectedFilters.volumes.length > 0;

  const totalActiveFilters = 
    selectedFilters.anos.length +
    selectedFilters.tags.length +
    selectedFilters.bnccCodes.length +
    selectedFilters.livros.length +
    selectedFilters.categorias.length +
    selectedFilters.marcas.length +
    selectedFilters.tipoObjeto.length +
    selectedFilters.videoCategory.length +
    selectedFilters.samr.length +
    selectedFilters.volumes.length;

  return (
    <div className="w-full lg:w-80 p-6 bg-white border-2 border-gray-300 shadow-xl h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-primary font-extrabold flex items-center gap-2.5 text-lg">
            <Filter className="w-6 h-6" />
            <span>Filtros</span>
          </h3>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm font-bold text-secondary hover:text-secondary/80 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <>
            <div className="space-y-3 mb-6">
              <div className="px-1">
                <h6 className="text-foreground font-bold text-base">Filtros Ativos</h6>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Categoria Filters */}
                {selectedFilters.categorias.map((categoria) => (
                  <button
                    key={`cat-${categoria}`}
                    onClick={() => onFilterChange('categorias', categoria)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 hover:border-purple-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-purple-700">{categoria}</span>
                    <X className="w-3 h-3 text-purple-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* Ano Filters */}
                {selectedFilters.anos.map((ano) => (
                  <button
                    key={`ano-${ano}`}
                    onClick={() => onFilterChange('anos', ano)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 hover:border-blue-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-blue-700">{ano}</span>
                    <X className="w-3 h-3 text-blue-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* Tag Filters */}
                {selectedFilters.tags.map((tag) => (
                  <button
                    key={`tag-${tag}`}
                    onClick={() => onFilterChange('tags', tag)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-green-100 hover:bg-green-200 border-2 border-green-300 hover:border-green-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-green-700">{tag}</span>
                    <X className="w-3 h-3 text-green-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* BNCC Code Filters */}
                {selectedFilters.bnccCodes.map((code) => (
                  <button
                    key={`bncc-${code}`}
                    onClick={() => onFilterChange('bnccCodes', code)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 hover:border-emerald-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-mono font-bold text-emerald-700">{code}</span>
                    <X className="w-3 h-3 text-emerald-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* Livro Filters */}
                {selectedFilters.livros.map((livro) => (
                  <button
                    key={`livro-${livro}`}
                    onClick={() => onFilterChange('livros', livro)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 hover:border-orange-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-orange-700">{livro}</span>
                    <X className="w-3 h-3 text-orange-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* Marca Filters */}
                {selectedFilters.marcas.map((marca) => (
                  <button
                    key={`marca-${marca}`}
                    onClick={() => onFilterChange('marcas', marca)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-100 hover:bg-indigo-200 border-2 border-indigo-300 hover:border-indigo-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-indigo-700">{marca}</span>
                    <X className="w-3 h-3 text-indigo-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* Video Category Filters (Audiovisual only) */}
                {selectedFilters.videoCategory.map((cat) => (
                  <button
                    key={`vidcat-${cat}`}
                    onClick={() => onFilterChange('videoCategory', cat)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-100 hover:bg-cyan-200 border-2 border-cyan-300 hover:border-cyan-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-cyan-700">{cat}</span>
                    <X className="w-3 h-3 text-cyan-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* Tipo de Objeto Filters (OED only) */}
                {selectedFilters.tipoObjeto.map((tipo) => (
                  <button
                    key={`tipo-${tipo}`}
                    onClick={() => onFilterChange('tipoObjeto', tipo)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-fuchsia-100 hover:bg-fuchsia-200 border-2 border-fuchsia-300 hover:border-fuchsia-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-fuchsia-700">{tipo}</span>
                    <X className="w-3 h-3 text-fuchsia-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* SAMR Filters */}
                {selectedFilters.samr.map((nivel) => (
                  <button
                    key={`samr-${nivel}`}
                    onClick={() => onFilterChange('samr', nivel)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 hover:border-amber-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-amber-700">{nivel}</span>
                    <X className="w-3 h-3 text-amber-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* Volume Filters */}
                {selectedFilters.volumes.map((volume) => (
                  <button
                    key={`volume-${volume}`}
                    onClick={() => onFilterChange('volumes', volume)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-gray-700">{volume}</span>
                    <X className="w-3 h-3 text-gray-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-0.5 bg-gray-300 rounded-full opacity-40"></div>
          </>
        )}

        {/* Divider */}
        {!hasActiveFilters && (
          <div className="h-0.5 bg-gray-300 rounded-full opacity-40"></div>
        )}

        {/* Anos Filter */}
        <div className="space-y-3 py-2">
          <button
            onClick={() => toggleSection('anos')}
            className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
          >
            <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Ano/série</h6>
            {expandedSections.anos ? (
              <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
          
          {expandedSections.anos && (
            <div className="space-y-2.5 pl-2">
              {filters.anos.map((ano) => {
                const isSelected = selectedFilters.anos.includes(ano);
                return (
                  <label
                    key={ano}
                    className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                      isSelected 
                        ? 'bg-blue-100 border-2 border-blue-300 shadow-md' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onFilterChange('anos', ano)}
                        className="w-5 h-5 rounded-lg border-2 border-border text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none checked:bg-blue-600 checked:border-blue-600 transition-all duration-300 shadow-sm"
                      />
                      {isSelected && (
                        <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base font-semibold transition-colors ${
                      isSelected ? 'text-blue-700' : 'text-muted-foreground group-hover:text-secondary'
                    }`}>
                      {ano}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

        {/* Componente Curricular Filter */}
        <div className="space-y-3 py-2">
          <button
            onClick={() => toggleSection('tags')}
            className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
          >
            <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Componente Curricular</h6>
            {expandedSections.tags ? (
              <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
          
          {expandedSections.tags && (
            <div className="space-y-2.5 pl-2">
              {filters.tags.map((tag) => {
                const isSelected = selectedFilters.tags.includes(tag);
                return (
                  <label
                    key={tag}
                    className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                      isSelected 
                        ? 'bg-green-100 border-2 border-green-300 shadow-md' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onFilterChange('tags', tag)}
                        className="w-5 h-5 rounded-lg border-2 border-border text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer appearance-none checked:bg-green-600 checked:border-green-600 transition-all duration-300 shadow-sm"
                      />
                      {isSelected && (
                        <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base font-semibold transition-colors ${
                      isSelected ? 'text-green-700' : 'text-muted-foreground group-hover:text-secondary'
                    }`}>
                      {tag}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

        {/* Código BNCC Filter */}
        <div className="space-y-3 py-2">
          <button
            onClick={() => toggleSection('bncc')}
            className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
          >
            <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Código BNCC</h6>
            {expandedSections.bncc ? (
              <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
          
          {expandedSections.bncc && (
            <div className="space-y-2.5 pl-2 max-h-48 overflow-y-auto">
              {filters.bnccCodes.map((code) => {
                const isSelected = selectedFilters.bnccCodes.includes(code);
                return (
                  <label
                    key={code}
                    className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                      isSelected 
                        ? 'bg-emerald-100 border-2 border-emerald-300 shadow-md' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onFilterChange('bnccCodes', code)}
                        className="w-5 h-5 rounded-lg border-2 border-border text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none checked:bg-emerald-600 checked:border-emerald-600 transition-all duration-300 shadow-sm"
                      />
                      {isSelected && (
                        <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base font-mono font-semibold transition-colors ${
                      isSelected ? 'text-emerald-700' : 'text-muted-foreground group-hover:text-secondary'
                    }`}>
                      {code}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

        {/* Livros Filter */}
        <div className="space-y-3 py-2">
          <button
            onClick={() => toggleSection('livros')}
            className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
          >
            <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Livros</h6>
            {expandedSections.livros ? (
              <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
          
          {expandedSections.livros && (
            <div className="space-y-2.5 pl-2">
              {filters.livros.map((livro) => {
                const isSelected = selectedFilters.livros.includes(livro);
                return (
                  <label
                    key={livro}
                    className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                      isSelected 
                        ? 'bg-orange-100 border-2 border-orange-300 shadow-md' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onFilterChange('livros', livro)}
                        className="w-5 h-5 rounded-lg border-2 border-border text-orange-600 focus:ring-2 focus:ring-orange-500 cursor-pointer appearance-none checked:bg-orange-600 checked:border-orange-600 transition-all duration-300 shadow-sm"
                      />
                      {isSelected && (
                        <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base font-semibold transition-colors ${
                      isSelected ? 'text-orange-700' : 'text-muted-foreground group-hover:text-secondary'
                    }`}>
                      {livro}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

        {/* Marcas Filter */}
        <div className="space-y-3 py-2">
          <button
            onClick={() => toggleSection('marcas')}
            className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
          >
            <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Marcas</h6>
            {expandedSections.marcas ? (
              <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
          
          {expandedSections.marcas && (
            <div className="space-y-2.5 pl-2">
              {filters.marcas.map((marca) => {
                const isSelected = selectedFilters.marcas.includes(marca);
                return (
                  <label
                    key={marca}
                    className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                      isSelected 
                        ? 'bg-indigo-100 border-2 border-indigo-300 shadow-md' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onFilterChange('marcas', marca)}
                        className="w-5 h-5 rounded-lg border-2 border-border text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none checked:bg-indigo-600 checked:border-indigo-600 transition-all duration-300 shadow-sm"
                      />
                      {isSelected && (
                        <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base font-semibold transition-colors ${
                      isSelected ? 'text-indigo-700' : 'text-muted-foreground group-hover:text-secondary'
                    }`}>
                      {marca}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Conditional Filters based on Content Type */}
        {/* Categoria de Vídeo - Aparece acima de Escala SAMR quando Audiovisual está selecionado */}
        {contentType === 'Audiovisual' && filters.videoCategory.length > 0 && (
          <>
            <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

            {/* Video Category Filter (Audiovisual only) */}
            <div className="space-y-3 py-2">
              <button
                onClick={() => toggleSection('videoCategory')}
                className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
              >
                <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Categoria de Vídeo</h6>
                {expandedSections.videoCategory ? (
                  <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>
              
              {expandedSections.videoCategory && (
                <div className="space-y-2.5 pl-2">
                  {filters.videoCategory.map((cat) => {
                    const isSelected = selectedFilters.videoCategory.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? 'bg-cyan-100 border-2 border-cyan-300 shadow-md' 
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onFilterChange('videoCategory', cat)}
                            className="w-5 h-5 rounded-lg border-2 border-border text-cyan-600 focus:ring-2 focus:ring-cyan-500 cursor-pointer appearance-none checked:bg-cyan-600 checked:border-cyan-600 transition-all duration-300 shadow-sm"
                          />
                          {isSelected && (
                            <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-base font-semibold transition-colors ${
                          isSelected ? 'text-cyan-700' : 'text-muted-foreground group-hover:text-secondary'
                        }`}>
                          {cat}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {contentType === 'OED' && filters.tipoObjeto.length > 0 && (
          <>
            <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

            {/* Tipo de Objeto Digital Filter (OED only) */}
            <div className="space-y-3 py-2">
              <button
                onClick={() => toggleSection('tipoObjeto')}
                className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
              >
                <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Tipo de Objeto Digital</h6>
                {expandedSections.tipoObjeto ? (
                  <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>
              
              {expandedSections.tipoObjeto && (
                <div className="space-y-2.5 pl-2">
                  {filters.tipoObjeto.map((tipo) => {
                    const isSelected = selectedFilters.tipoObjeto.includes(tipo);
                    return (
                      <label
                        key={tipo}
                        className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? 'bg-fuchsia-100 border-2 border-fuchsia-300 shadow-md' 
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onFilterChange('tipoObjeto', tipo)}
                            className="w-5 h-5 rounded-lg border-2 border-border text-fuchsia-600 focus:ring-2 focus:ring-fuchsia-500 cursor-pointer appearance-none checked:bg-fuchsia-600 checked:border-fuchsia-600 transition-all duration-300 shadow-sm"
                          />
                          {isSelected && (
                            <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-base font-semibold transition-colors ${
                          isSelected ? 'text-fuchsia-700' : 'text-muted-foreground group-hover:text-secondary'
                        }`}>
                          {tipo}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* SAMR Filter - Always visible, aparece após Categoria de Vídeo quando Audiovisual está selecionado */}
        {filters.samr.length > 0 && (
          <>
            <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

            <div className="space-y-3 py-2">
              <button
                onClick={() => toggleSection('samr')}
                className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
              >
                <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Escala SAMR</h6>
                {expandedSections.samr ? (
                  <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>
              
              {expandedSections.samr && (
                <div className="space-y-2.5 pl-2">
                  {filters.samr.map((nivel) => {
                    const isSelected = selectedFilters.samr.includes(nivel);
                    return (
                      <label
                        key={nivel}
                        className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? 'bg-amber-100 border-2 border-amber-300 shadow-md' 
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onFilterChange('samr', nivel)}
                            className="w-5 h-5 rounded-lg border-2 border-border text-amber-600 focus:ring-2 focus:ring-amber-500 cursor-pointer appearance-none checked:bg-amber-600 checked:border-amber-600 transition-all duration-300 shadow-sm"
                          />
                          {isSelected && (
                            <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-base font-semibold transition-colors ${
                          isSelected ? 'text-amber-700' : 'text-muted-foreground group-hover:text-secondary'
                        }`}>
                          {nivel}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Volume Filter - Always visible */}
        {filters.volumes.length > 0 && (
          <>
            <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

            <div className="space-y-3 py-2">
              <button
                onClick={() => toggleSection('volumes')}
                className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
              >
                <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Volume</h6>
                {expandedSections.volumes ? (
                  <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>
              
              {expandedSections.volumes && (
                <div className="space-y-2.5 pl-2">
                  {filters.volumes.map((volume) => {
                    const isSelected = selectedFilters.volumes.includes(volume);
                    return (
                      <label
                        key={volume}
                        className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? 'bg-gray-100 border-2 border-gray-300 shadow-md' 
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onFilterChange('volumes', volume)}
                            className="w-5 h-5 rounded-lg border-2 border-border text-gray-600 focus:ring-2 focus:ring-gray-500 cursor-pointer appearance-none checked:bg-gray-600 checked:border-gray-600 transition-all duration-300 shadow-sm"
                          />
                          {isSelected && (
                            <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-base font-semibold transition-colors ${
                          isSelected ? 'text-gray-700' : 'text-muted-foreground group-hover:text-secondary'
                        }`}>
                          {volume}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}