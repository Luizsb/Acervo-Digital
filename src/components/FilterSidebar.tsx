import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X, Search } from 'lucide-react';
import { getComponentFullName, getSegmentFullName, getMarcaFullName } from '../utils/curriculumColors';

interface FilterSidebarProps {
  filters: {
    anos: string[];
    tags: string[];
    bnccCodes: string[];
    segmentos: string[];
    categorias: string[];
    marcas: string[];
    tipoObjeto: string[];
    videoCategory: string[];
    samr: string[];
    volumes: string[];
    vestibular: string[];
    capitulo: string[];
  };
  selectedFilters: {
    anos: string[];
    tags: string[];
    bnccCodes: string[];
    segmentos: string[];
    categorias: string[];
    marcas: string[];
    tipoObjeto: string[];
    videoCategory: string[];
    samr: string[];
    volumes: string[];
    vestibular: string[];
    capitulo: string[];
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
    segmentos: false,
    vestibular: false,
    capitulo: false,
    categorias: false,
    marcas: false,
    tipoObjeto: false,
    videoCategory: false,
    samr: false,
    volumes: false,
  });
  const [bnccSearchQuery, setBnccSearchQuery] = useState('');

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
    selectedFilters.segmentos.length > 0 ||
    selectedFilters.categorias.length > 0 ||
    selectedFilters.marcas.length > 0 ||
    selectedFilters.tipoObjeto.length > 0 ||
    selectedFilters.videoCategory.length > 0 ||
    selectedFilters.samr.length > 0 ||
    selectedFilters.volumes.length > 0 ||
    selectedFilters.vestibular.length > 0 ||
    selectedFilters.capitulo.length > 0;

  const totalActiveFilters = 
    selectedFilters.anos.length +
    selectedFilters.tags.length +
    selectedFilters.bnccCodes.length +
    selectedFilters.vestibular.length +
    selectedFilters.capitulo.length +
    selectedFilters.segmentos.length +
    selectedFilters.categorias.length +
    selectedFilters.marcas.length +
    selectedFilters.tipoObjeto.length +
    selectedFilters.videoCategory.length +
    selectedFilters.samr.length +
    selectedFilters.volumes.length;

  // Função helper para aplicar scroll quando há mais de 6 itens
  // Cada item tem aproximadamente 50px de altura (p-3 = 12px top + 12px bottom + ~26px conteúdo)
  // Com space-y-2.5 (10px gap), 6 itens = (50px * 6) + (10px * 5) = 300px + 50px = 350px
  // Mas vamos usar 300px para mostrar exatamente 6 itens
  const getScrollClasses = (itemCount: number) => {
    if (itemCount > 6) {
      return 'max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400';
    }
    return '';
  };

  return (
    <div id="acervo-filters" className="w-full lg:w-80 p-6 bg-white border-2 border-gray-300 shadow-xl h-full overflow-y-auto">
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
              <h6 className="text-foreground font-bold text-base px-1">Filtros Ativos</h6>
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
                    <span className="text-sm font-bold text-green-700">{getComponentFullName(tag)}</span>
                    <X className="w-3 h-3 text-green-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* BNCC Code Filters */}
                {selectedFilters.bnccCodes.map((code) => (
                  <button
                    key={`bncc-${code}`}
                    onClick={() => onFilterChange('bnccCodes', code)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-mono font-bold text-gray-700">{code}</span>
                    <X className="w-3 h-3 text-gray-700 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                ))}

                {/* Segmento Filters */}
                {selectedFilters.segmentos.map((segmento) => (
                  <button
                    key={`segmento-${segmento}`}
                    onClick={() => onFilterChange('segmentos', segmento)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 hover:border-orange-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-orange-700">{getSegmentFullName(segmento)}</span>
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
                    <span className="text-sm font-bold text-indigo-700">{getMarcaFullName(marca)}</span>
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
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 hover:border-rose-400 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-rose-700">{volume}</span>
                    <X className="w-3 h-3 text-rose-700 group-hover:rotate-90 transition-transform duration-300" />
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
            <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.anos.length)}`} style={filters.anos.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
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
            <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.tags.length)}`} style={filters.tags.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
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
                      {getComponentFullName(tag)}
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
            <div className="space-y-3">
              {/* Caixa de pesquisa */}
              <div className="relative pl-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Buscar código BNCC..."
                    value={bnccSearchQuery}
                    onChange={(e) => setBnccSearchQuery(e.target.value)}
                    className="w-full pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-mono leading-normal"
                    style={{ lineHeight: '1.5', paddingLeft: '2.2rem' }}
                  />
                  {bnccSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBnccSearchQuery('')}
                      className="absolute right-4 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      style={{ top: '50%', transform: 'translateY(-50%)' }}
                      aria-label="Limpar busca"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="relative">
                {/* Container com scroll visível - mostra 6 itens e rola para ver mais */}
                {(() => {
                  const filteredCodes = filters.bnccCodes.filter((code) => 
                    code.toLowerCase().includes(bnccSearchQuery.toLowerCase())
                  );
                  return (
                    <div 
                      className="space-y-2.5 pl-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                      style={filteredCodes.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}
                    >
                      {filteredCodes.map((code) => {
                const isSelected = selectedFilters.bnccCodes.includes(code);
                return (
                  <label
                    key={code}
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
                        onChange={() => onFilterChange('bnccCodes', code)}
                        className="w-5 h-5 rounded-lg border-2 border-border text-gray-600 focus:ring-2 focus:ring-gray-500 cursor-pointer appearance-none checked:bg-gray-600 checked:border-gray-600 transition-all duration-300 shadow-sm"
                      />
                      {isSelected && (
                        <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base font-mono font-semibold transition-colors ${
                      isSelected ? 'text-gray-700' : 'text-muted-foreground group-hover:text-secondary'
                    }`}>
                      {code}
                    </span>
                  </label>
                );
              })}
              
                      {/* Mensagem quando não há resultados */}
                      {filteredCodes.length === 0 && (
                        <div className="text-center py-6 text-sm text-gray-500">
                          Nenhum código encontrado para "{bnccSearchQuery}"
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

        {/* Segmentos Filter */}
        <div className="space-y-3 py-2">
          <button
            onClick={() => toggleSection('segmentos')}
            className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
          >
            <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Segmentos</h6>
            {expandedSections.segmentos ? (
              <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
          
          {expandedSections.segmentos && (
            <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.segmentos.length)}`} style={filters.segmentos.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
              {filters.segmentos.map((segmento) => {
                const isSelected = selectedFilters.segmentos.includes(segmento);
                return (
                  <label
                    key={segmento}
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
                        onChange={() => onFilterChange('segmentos', segmento)}
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
                      {getSegmentFullName(segmento)}
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
            <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.marcas.length)}`} style={filters.marcas.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
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
                      {getMarcaFullName(marca)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Conditional Filters based on Content Type */}
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
                <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.videoCategory.length)}`} style={filters.videoCategory.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
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
                <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.tipoObjeto.length)}`} style={filters.tipoObjeto.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
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

        {/* SAMR Filter - Always visible */}
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
                <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.samr.length)}`} style={filters.samr.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
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
                <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.volumes.length)}`} style={filters.volumes.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
                  {filters.volumes.map((volume) => {
                    const isSelected = selectedFilters.volumes.includes(volume);
                    return (
                      <label
                        key={volume}
                        className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? 'bg-rose-100 border-2 border-rose-300 shadow-md' 
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onFilterChange('volumes', volume)}
                            className="w-5 h-5 rounded-lg border-2 border-border text-rose-600 focus:ring-2 focus:ring-rose-500 cursor-pointer appearance-none checked:bg-rose-600 checked:border-rose-600 transition-all duration-300 shadow-sm"
                          />
                          {isSelected && (
                            <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-base font-semibold transition-colors ${
                          isSelected ? 'text-rose-700' : 'text-muted-foreground group-hover:text-secondary'
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

        {/* Vestibular Filter - Only for Audiovisual */}
        {(contentType === 'Audiovisual' || contentType === 'Todos') && filters.vestibular.length > 0 && (
          <>
            <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

            <div className="space-y-3 py-2">
              <button
                onClick={() => toggleSection('vestibular')}
                className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
              >
                <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Vestibular</h6>
                {expandedSections.vestibular ? (
                  <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>
              
              {expandedSections.vestibular && (
                <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.vestibular.length)}`} style={filters.vestibular.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
                  {filters.vestibular.map((vest) => {
                    const isSelected = selectedFilters.vestibular.includes(vest);
                    return (
                      <label
                        key={vest}
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
                            onChange={() => onFilterChange('vestibular', vest)}
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
                          {vest}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Capítulo Filter - Only for Audiovisual */}
        {(contentType === 'Audiovisual' || contentType === 'Todos') && filters.capitulo.length > 0 && (
          <>
            <div className="h-0.5 bg-gray-200 rounded-full my-4"></div>

            <div className="space-y-3 py-2">
              <button
                onClick={() => toggleSection('capitulo')}
                className="w-full flex items-center justify-between group hover:bg-gray-100 p-3 rounded-xl transition-all duration-300"
              >
                <h6 className="text-foreground group-hover:text-secondary transition-colors font-bold text-base">Capítulo</h6>
                {expandedSections.capitulo ? (
                  <ChevronUp className="w-6 h-6 text-secondary transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>
              
              {expandedSections.capitulo && (
                <div className={`space-y-2.5 pl-2 ${getScrollClasses(filters.capitulo.length)}`} style={filters.capitulo.length > 6 ? { maxHeight: '300px', overflowY: 'auto' } : {}}>
                  {filters.capitulo.map((cap) => {
                    const isSelected = selectedFilters.capitulo.includes(cap);
                    return (
                      <label
                        key={cap}
                        className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? 'bg-teal-100 border-2 border-teal-300 shadow-md' 
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onFilterChange('capitulo', cap)}
                            className="w-5 h-5 rounded-lg border-2 border-border text-teal-600 focus:ring-2 focus:ring-teal-500 cursor-pointer appearance-none checked:bg-teal-600 checked:border-teal-600 transition-all duration-300 shadow-sm"
                          />
                          {isSelected && (
                            <svg className="w-5 h-5 absolute inset-0 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-base font-semibold transition-colors ${
                          isSelected ? 'text-teal-700' : 'text-muted-foreground group-hover:text-secondary'
                        }`}>
                          {cap}
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