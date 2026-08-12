import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Boxes,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  Layers,
  ListVideo,
  Puzzle,
  Search,
  Send,
  Shapes,
  Tag,
  UserRound,
  X,
} from 'lucide-react';
import { getComponentFullName, getSegmentFullName, getMarcaFullName } from '../utils/curriculumColors';
import './FilterSidebar.css';

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
    macroformatos: string[];
    colecoes: string[];
    livros: string[];
    blocos: string[];
    palavrasChave: string[];
    enviosEscola: string[];
    usuariosPrincipais: string[];
    bnccDescriptions?: Record<string, string>;
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
    macroformatos: string[];
    colecoes: string[];
    livros: string[];
    blocos: string[];
    palavrasChave: string[];
    enviosEscola: string[];
    usuariosPrincipais: string[];
  };
  onFilterChange: (category: string, value: string) => void;
  onClearFilters: () => void;
  contentType: 'Todos' | 'Audiovisual' | 'OED';
}

type FilterItem = {
  key: string;
  title: string;
  icon: React.ReactNode;
  options: string[];
  selected: string[];
  formatLabel?: (value: string) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  descriptions?: Record<string, string>;
};

export function FilterSidebar({
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  contentType,
}: FilterSidebarProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bnccSearchQuery, setBnccSearchQuery] = useState('');
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateScrollIndicator = () => {
    const element = scrollRef.current;
    if (!element) return;
    const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
    setHasMoreBelow(remaining > 12);
  };

  const toggle = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
    if (key !== 'bnccCodes') setBnccSearchQuery('');
  };

  const activeCount = useMemo(
    () =>
      Object.values(selectedFilters).reduce(
        (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
        0
      ),
    [selectedFilters]
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateScrollIndicator);
    const handleResize = () => updateScrollIndicator();
    window.addEventListener('resize', handleResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, [expanded, activeCount]);

  const activeEntries = useMemo(() => {
    const entries: { category: string; value: string; label: string }[] = [];
    const push = (category: string, values: string[], format?: (v: string) => string) => {
      values.forEach((value) => {
        entries.push({ category, value, label: format ? format(value) : value });
      });
    };
    push('colecoes', selectedFilters.colecoes);
    push('livros', selectedFilters.livros);
    push('blocos', selectedFilters.blocos);
    push('enviosEscola', selectedFilters.enviosEscola);
    push('usuariosPrincipais', selectedFilters.usuariosPrincipais);
    push('segmentos', selectedFilters.segmentos, getSegmentFullName);
    push('anos', selectedFilters.anos);
    push('tags', selectedFilters.tags, getComponentFullName);
    push('macroformatos', selectedFilters.macroformatos);
    push('marcas', selectedFilters.marcas, getMarcaFullName);
    push('bnccCodes', selectedFilters.bnccCodes);
    push('videoCategory', selectedFilters.videoCategory);
    push('tipoObjeto', selectedFilters.tipoObjeto);
    push('samr', selectedFilters.samr);
    push('volumes', selectedFilters.volumes, (v) => (/^\d+$/.test(v) ? `Vol. ${v}` : v));
    push('vestibular', selectedFilters.vestibular);
    push('capitulo', selectedFilters.capitulo);
    return entries;
  }, [selectedFilters]);

  const renderOptions = (item: FilterItem) => {
    const query = bnccSearchQuery.trim().toLowerCase();
    const filtered = item.options.filter((value) => {
      if (!item.searchable || !query) return true;
      const label = (item.formatLabel ? item.formatLabel(value) : value).toLowerCase();
      const desc = (item.descriptions?.[value] || '').toLowerCase();
      return value.toLowerCase().includes(query) || label.includes(query) || desc.includes(query);
    });

    if (filtered.length === 0) {
      return <p className="px-3 py-3 text-sm text-muted-foreground">Nenhum item encontrado</p>;
    }

    return (
      <div
        className="space-y-1 px-2 pb-3 overflow-y-auto"
        style={filtered.length > 10 ? { maxHeight: 260 } : undefined}
      >
        {filtered.map((value) => {
          const isSelected = item.selected.includes(value);
          const label = item.formatLabel ? item.formatLabel(value) : value;
          return (
            <label
              key={value}
              title={item.descriptions?.[value]}
              className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors ${
                isSelected
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground/80 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onFilterChange(item.key, value)}
                className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer shrink-0"
              />
              <span className={`leading-snug break-words ${item.key === 'bnccCodes' ? 'font-mono text-[13px]' : ''}`}>
                {label}
              </span>
            </label>
          );
        })}
      </div>
    );
  };

  const renderItem = (item: FilterItem) => {
    if (!item.options.length) return null;
    const open = expanded === item.key;
    const count = item.selected.length;

    return (
      <div key={item.key} className="catalog-filter-item">
        <button
          type="button"
          onClick={() => toggle(item.key)}
          className={`catalog-filter-trigger ${open ? 'catalog-filter-trigger-open' : ''}`}
        >
          <span className={`catalog-filter-icon ${open ? 'catalog-filter-icon-open' : ''}`}>
            {item.icon}
          </span>
          <span className="catalog-filter-title">
            {item.title}
          </span>
          {count > 0 && (
            <span className="catalog-filter-count" aria-label={`${count} selecionado(s)`}>
              {count}
            </span>
          )}
          <ChevronRight
            className={`catalog-filter-chevron ${open ? 'catalog-filter-chevron-open' : ''}`}
          />
        </button>

        {open && (
          <div className="catalog-filter-options">
            {item.searchable && (
              <div className="catalog-filter-search-wrap">
                <div className="catalog-filter-search">
                  <Search className="catalog-filter-search-icon" />
                  <input
                    type="text"
                    placeholder={item.searchPlaceholder || 'Buscar...'}
                    value={bnccSearchQuery}
                    onChange={(e) => setBnccSearchQuery(e.target.value)}
                    className="catalog-filter-search-input"
                  />
                  {bnccSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBnccSearchQuery('')}
                      className="catalog-filter-search-clear"
                      aria-label="Limpar busca"
                    >
                      <X />
                    </button>
                  )}
                </div>
              </div>
            )}
            {renderOptions(item)}
          </div>
        )}
      </div>
    );
  };

  const iconCls = 'catalog-filter-item-svg';

  const groups: { label: string; items: FilterItem[] }[] = [
    {
      label: 'Localização',
      items: [
        {
          key: 'colecoes',
          title: 'Coleção',
          icon: <FolderOpen className={iconCls} />,
          options: filters.colecoes || [],
          selected: selectedFilters.colecoes,
        },
        {
          key: 'livros',
          title: 'Livro',
          icon: <BookOpen className={iconCls} />,
          options: filters.livros || [],
          selected: selectedFilters.livros,
        },
        {
          key: 'blocos',
          title: 'Bloco',
          icon: <Boxes className={iconCls} />,
          options: filters.blocos || [],
          selected: selectedFilters.blocos,
        },
        {
          key: 'enviosEscola',
          title: 'Envio à escola',
          icon: <Send className={iconCls} />,
          options: filters.enviosEscola || [],
          selected: selectedFilters.enviosEscola,
        },
        {
          key: 'volumes',
          title: 'Volume',
          icon: <Layers className={iconCls} />,
          options: filters.volumes,
          selected: selectedFilters.volumes,
          formatLabel: (v) => (/^\d+$/.test(v) ? `Vol. ${v}` : v),
        },
      ],
    },
    {
      label: 'Currículo',
      items: [
        {
          key: 'segmentos',
          title: 'Segmento',
          icon: <GraduationCap className={iconCls} />,
          options: filters.segmentos,
          selected: selectedFilters.segmentos,
          formatLabel: getSegmentFullName,
        },
        {
          key: 'anos',
          title: 'Ano/série',
          icon: <Calendar className={iconCls} />,
          options: filters.anos,
          selected: selectedFilters.anos,
        },
        {
          key: 'tags',
          title: 'Componente',
          icon: <Puzzle className={iconCls} />,
          options: filters.tags,
          selected: selectedFilters.tags,
          formatLabel: getComponentFullName,
        },
      ],
    },
    {
      label: 'Detalhes',
      items: [
        {
          key: 'macroformatos',
          title: 'Macroformato',
          icon: <Shapes className={iconCls} />,
          options: filters.macroformatos,
          selected: selectedFilters.macroformatos,
        },
        {
          key: 'marcas',
          title: 'Marca',
          icon: <Tag className={iconCls} />,
          options: filters.marcas,
          selected: selectedFilters.marcas,
          formatLabel: getMarcaFullName,
        },
        {
          key: 'tipoObjeto',
          title: 'Tipo de objeto',
          icon: <FileText className={iconCls} />,
          options: filters.tipoObjeto,
          selected: selectedFilters.tipoObjeto,
        },
        {
          key: 'usuariosPrincipais',
          title: 'Usuário principal',
          icon: <UserRound className={iconCls} />,
          options: filters.usuariosPrincipais,
          selected: selectedFilters.usuariosPrincipais,
        },
        ...(contentType === 'Audiovisual'
          ? [
              {
                key: 'videoCategory',
                title: 'Categoria de vídeo',
                icon: <ListVideo className={iconCls} />,
                options: filters.videoCategory,
                selected: selectedFilters.videoCategory,
              } as FilterItem,
            ]
          : []),
        {
          key: 'bnccCodes',
          title: 'BNCC',
          icon: <Layers className={iconCls} />,
          options: filters.bnccCodes,
          selected: selectedFilters.bnccCodes,
          searchable: true,
          searchPlaceholder: 'Código ou habilidade',
          descriptions: filters.bnccDescriptions,
        },
        {
          key: 'samr',
          title: 'Escala SAMR',
          icon: <Shapes className={iconCls} />,
          options: filters.samr,
          selected: selectedFilters.samr,
        },
        {
          key: 'vestibular',
          title: 'Vestibular',
          icon: <GraduationCap className={iconCls} />,
          options: filters.vestibular,
          selected: selectedFilters.vestibular,
        },
        {
          key: 'capitulo',
          title: 'Capítulo',
          icon: <BookOpen className={iconCls} />,
          options: filters.capitulo,
          selected: selectedFilters.capitulo,
        },
      ],
    },
  ];

  return (
    <aside
      id="acervo-filters"
      className="relative flex h-full min-h-0 w-full flex-col bg-white font-sans"
    >
      <div className="shrink-0 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2.5 text-lg font-extrabold text-primary">
            <Filter className="w-5 h-5 stroke-2" />
            Filtros
            {activeCount > 0 && (
              <span className="text-sm font-semibold text-secondary">({activeCount})</span>
            )}
          </h3>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-sm font-semibold text-secondary hover:text-secondary/80"
            >
              Limpar
            </button>
          )}
        </div>

        {activeEntries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeEntries.map(({ category, value, label }) => (
              <button
                key={`${category}-${value}`}
                type="button"
                onClick={() => onFilterChange(category, value)}
                className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-foreground/80 hover:bg-gray-200"
                title="Remover filtro"
              >
                <span className="truncate">{label}</span>
                <X className="w-3 h-3 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollIndicator}
        className="catalog-filter-scroll min-h-0 flex-1 overflow-y-auto"
      >
        {groups.map((group) => {
          const visible = group.items.filter((item) => item.options.length > 0);
          if (visible.length === 0) return null;
          return (
            <section key={group.label} className="catalog-filter-group">
              <h4 className="catalog-filter-group-title">
                {group.label}
              </h4>
              <div className="catalog-filter-group-items">
                {visible.map((item) => renderItem(item))}
              </div>
            </section>
          );
        })}
        <div className="h-4" />
      </div>

      {hasMoreBelow && (
        <button
          type="button"
          className="catalog-filter-more"
          onClick={() =>
            scrollRef.current?.scrollBy({ top: 240, behavior: 'smooth' })
          }
          aria-label="Ver mais filtros abaixo"
        >
          <span>Mais filtros</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
}
