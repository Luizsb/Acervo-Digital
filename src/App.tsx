import React, { useState, useEffect, useMemo } from "react";
import { Navigation } from "./components/Navigation";
import { ProjectGrid } from "./components/ProjectGrid";
import { ProjectDetailsPage } from "./components/ProjectDetailsPage";
import { ProfileSettingsPage } from "./components/ProfileSettingsPage";
import { FavoritesPage } from "./components/FavoritesPage";
import { FilterSidebar } from "./components/FilterSidebar";
import { MobileFilterDrawer } from "./components/MobileFilterDrawer";
import {
  SearchX,
  Sparkles,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { BookOpen, Video, Gamepad2 } from "lucide-react";
import { ODAFromExcel } from "./utils/importODAs";
import { loadODAsFromDatabase } from "./utils/loadODAs";
import { loadAudiovisualFromDatabase } from "./utils/loadAudiovisual";
import { getComponentFullName, getSegmentFullName, sortSegments, getMarcaFullName } from "./utils/curriculumColors";
import { Pagination } from "./components/Pagination";
import { ScrollToTop } from "./components/ScrollToTop";

// Audiovisuais agora são carregados do banco de dados via loadAudiovisualFromDatabase()

// Componentes Curriculares permitidos (matérias escolares)
const COMPONENTES_CURRICULARES = [
  "Língua Portuguesa",
  "Matemática",
  "Ciências",
  "História",
  "Geografia",
  "Arte",
  "Inglês",
  "Educação Física",
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<ODAFromExcel | null>(null);
  const [currentPage, setCurrentPage] = useState<
    "home" | "gallery" | "settings" | "favorites"
  >("home");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [odasFromExcel, setOdasFromExcel] = useState<ODAFromExcel[]>([]);
  const [audiovisualFromDB, setAudiovisualFromDB] = useState<ODAFromExcel[]>([]);
  const [serverConnectionError, setServerConnectionError] = useState<string | null>(null);
  
  // Carregar ODAs do banco de dados ao montar o componente
  useEffect(() => {
    const loadODAs = async () => {
      try {
        setServerConnectionError(null);
        const odas = await loadODAsFromDatabase();
        // Garantir que ODAs sempre tenham IDs > 1000 para evitar conflitos
        const odasWithAdjustedIds = odas.map((oda, index) => {
          const originalId = oda.id || 0;
          // Ajustar IDs para faixa segura
          const adjustedId = originalId > 0 && originalId <= 100 
            ? originalId + 10000  // Mover para faixa segura
            : (originalId > 0 ? originalId : (index + 1) + 10000);
          return {
            ...oda,
            id: adjustedId,
          };
        });
        setOdasFromExcel(odasWithAdjustedIds);
        console.log(`✅ ${odasWithAdjustedIds.length} ODAs carregados do banco de dados`);
      } catch (error: any) {
        console.error('Erro ao carregar ODAs do banco de dados:', error);
        // Verificar se é erro de conexão
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('ConnectionError') ||
            error?.message?.includes('ERR_CONNECTION_REFUSED') ||
            error?.name === 'TypeError') {
          setServerConnectionError(
            'Servidor backend não está rodando. Por favor, inicie o servidor em um terminal separado.'
          );
        }
      }
    };
    
    loadODAs();
  }, []);

  // Carregar Audiovisuais do banco de dados
  useEffect(() => {
    const loadAudiovisual = async () => {
      try {
        setServerConnectionError(null);
        const audiovisual = await loadAudiovisualFromDatabase();
        // IDs dos audiovisuais: usar IDs > 50000 para evitar conflitos
        const audiovisualWithAdjustedIds = audiovisual.map((av, index) => {
          const originalId = av.id || 0;
          const adjustedId = originalId > 0 
            ? originalId + 50000  // Mover para faixa segura
            : (index + 1) + 50000;
          return {
            ...av,
            id: adjustedId,
          };
        });
        setAudiovisualFromDB(audiovisualWithAdjustedIds);
        console.log(`✅ ${audiovisualWithAdjustedIds.length} Audiovisuais carregados do banco de dados`);
      } catch (error: any) {
        console.error('Erro ao carregar Audiovisuais do banco de dados:', error);
        // Não mostrar erro de conexão novamente se já foi mostrado
      }
    };
    
    loadAudiovisual();
  }, []);
  
  // Combinar ODAs e Audiovisuais do banco de dados
  const projects = [
    ...odasFromExcel, // ODAs carregados do banco
    ...audiovisualFromDB, // Audiovisuais carregados do banco
  ];
  const [contentTypeFilter, setContentTypeFilter] = useState<
    "Todos" | "Audiovisual" | "OED"
  >("Todos");
  const [isMobileFilterOpen, setIsMobileFilterOpen] =
    useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    anos: [] as string[],
    tags: [] as string[],
    bnccCodes: [] as string[],
    segmentos: [] as string[],
    categorias: [] as string[],
    marcas: [] as string[],
    tipoObjeto: [] as string[],
    videoCategory: [] as string[],
    samr: [] as string[],
    volumes: [] as string[],
    vestibular: [] as string[],
    capitulo: [] as string[],
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("favorites");
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos do localStorage:', error);
      // Limpar localStorage corrompido
      localStorage.removeItem("favorites");
      setFavorites([]);
    }
  }, []);

  // Toggle favorite
  const handleToggleFavorite = (projectId: number) => {
    if (!projectId || isNaN(projectId)) {
      console.error('ID de projeto inválido:', projectId);
      return;
    }
    
    setFavorites((prev) => {
      // Garantir que prev é um array válido
      const currentFavorites = Array.isArray(prev) ? prev : [];
      
      // Normalizar IDs para comparação (garantir que são números)
      const normalizedProjectId = Number(projectId);
      const normalizedFavorites = currentFavorites.map(id => Number(id));
      
      // Verificar se já está nos favoritos
      const isFavorite = normalizedFavorites.includes(normalizedProjectId);
      
      // Remover duplicatas e criar novo array
      const uniqueFavorites = normalizedFavorites.filter(id => id !== normalizedProjectId);
      const newFavorites = isFavorite 
        ? uniqueFavorites  // Remover
        : [...uniqueFavorites, normalizedProjectId];  // Adicionar
      
      // Garantir que não há duplicatas
      const finalFavorites = Array.from(new Set(newFavorites));
      
      try {
        localStorage.setItem("favorites", JSON.stringify(finalFavorites));
        console.log(`Favorito ${isFavorite ? 'removido' : 'adicionado'}:`, normalizedProjectId, 'Total:', finalFavorites.length);
      } catch (error) {
        console.error('Erro ao salvar favoritos no localStorage:', error);
      }
      
      return finalFavorites;
    });
  };

  // Filter projects by content type first
  const contentTypeFilteredProjects = useMemo(() => {
    return contentTypeFilter === "Todos"
      ? projects
      : projects.filter(
          (p) => p.contentType === contentTypeFilter,
        );
  }, [projects, contentTypeFilter]);

  // Extract unique values for filters based on content type
  // Usar useMemo para recalcular quando projects mudar (incluindo quando odasFromExcel for carregado)
  const filterOptions = useMemo(() => {
    console.log('🔄 Recalculando filterOptions...');
    console.log('Total de projects:', projects.length);
    console.log('ODAs da planilha:', odasFromExcel.length);
    
    const allBnccCodes = contentTypeFilteredProjects
      .map((p) => p.bnccCode)
      .filter((code) => {
        if (!code) return false;
        const trimmed = String(code).trim();
        return trimmed !== '' && trimmed !== 'undefined' && trimmed !== 'null';
      })
      .map((code) => String(code).trim());
    
    const uniqueBnccCodes = Array.from(new Set(allBnccCodes));
    console.log('📊 Códigos BNCC encontrados:', {
      total: allBnccCodes.length,
      únicos: uniqueBnccCodes.length,
      primeiros: uniqueBnccCodes.slice(0, 10)
    });
    
    // Normalizar anos para evitar duplicatas (maiúscula/minúscula, símbolos de grau)
    const normalizeAnoKey = (ano: string): string => {
      if (!ano) return '';
      // Normalizar símbolos de grau (°, º, o) e espaços, converter para minúscula para comparação
      return ano
        .trim()
        .replace(/[°ºo]/gi, '°')
        .replace(/\s+/g, ' ')
        .toLowerCase();
    };

    // Usar um Map para manter o valor original (primeira ocorrência)
    const anosMap = new Map<string, string>();
    contentTypeFilteredProjects.forEach((p) => {
      if (p.location) {
        const normalizedKey = normalizeAnoKey(p.location);
        if (normalizedKey && !anosMap.has(normalizedKey)) {
          anosMap.set(normalizedKey, p.location);
        }
      }
    });

    const anosUnicos = Array.from(anosMap.values()).sort((a, b) => {
      // Ordenar numericamente quando possível
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b, 'pt-BR');
    });

    return {
    anos: anosUnicos,
    tags: Array.from(
      new Set(
        contentTypeFilteredProjects
          .flatMap((p) => {
            // Garantir que sempre temos um array de tags
            const rawTags = p.tags && p.tags.length > 0 
              ? p.tags 
              : (p.tag ? [p.tag] : []);
            // Converter para nomes completos para evitar duplicatas (ex: "ART" e "Arte" ambos viram "Arte")
            return rawTags
              .filter(Boolean) // Remove valores vazios/null/undefined
              .map(tag => getComponentFullName(tag));
          })
          .filter(Boolean), // Remove valores vazios/null/undefined após conversão
      ),
    ).sort(),

      // Códigos BNCC: baseados nos projetos filtrados pelo tipo de conteúdo selecionado
      // para mostrar apenas os códigos relevantes ao filtro ativo
      bnccCodes: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.bnccCode)
            .filter((code) => {
              if (!code) return false;
              const trimmed = String(code).trim();
              return trimmed !== '' && trimmed !== 'undefined' && trimmed !== 'null';
            })
            .map((code) => String(code).trim()),
        ),
      ).sort(),
    segmentos: sortSegments(
      Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.segmento)
            .filter(Boolean)
            .map(seg => getSegmentFullName(seg || '')) // Converter para nomes completos antes de criar o Set
        )
      )
    ) as string[],
    categorias: Array.from(
      new Set(
        contentTypeFilteredProjects
          .map((p) => p.category)
          .filter((cat): cat is string => Boolean(cat)),
      ),
    ).sort(),
    marcas: Array.from(
      new Set(
        contentTypeFilteredProjects
          .map((p) => p.marca)
          .filter(Boolean)
            .map(marca => getMarcaFullName(marca || '')) // Converter para nomes completos antes de criar o Set
      ),
    ).sort(),
    tipoObjeto: Array.from(
      new Set(
        contentTypeFilteredProjects
          .filter((p) => p.contentType === "OED" && 'tipoObjeto' in p)
          .map((p) => (p as ODAFromExcel).tipoObjeto)
          .filter(Boolean) as string[],
      ),
    ).sort(),
    videoCategory: Array.from(
      new Set(
        contentTypeFilteredProjects
          .filter((p) => p.contentType === "Audiovisual")
          .map((p) => p.videoCategory)
          .filter((cat): cat is string => Boolean(cat)),
      ),
    ).sort(),
    samr: Array.from(
      new Set(
        contentTypeFilteredProjects
          .map((p) => p.samr)
          .filter((s): s is string => Boolean(s)),
      ),
    ).sort(),
      volumes: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.volume)
            .filter((v): v is string => Boolean(v)),
        ),
      ).sort(),
      vestibular: Array.from(
        new Set(
          contentTypeFilteredProjects
            .filter((p) => p.contentType === "Audiovisual" && 'vestibular' in p)
            .map((p) => (p as any).vestibular)
            .filter((v): v is string => Boolean(v)),
        ),
      ).sort(),
      capitulo: Array.from(
        new Set(
          contentTypeFilteredProjects
            .filter((p) => p.contentType === "Audiovisual" && 'capitulo' in p)
            .map((p) => (p as any).capitulo)
            .filter((v): v is string => Boolean(v)),
        ),
      ).sort(),
    };
  }, [contentTypeFilteredProjects, projects, odasFromExcel, audiovisualFromDB]);

  // Filter ODAs based on search query and selected filters
  const filteredProjects = contentTypeFilteredProjects.filter(
    (project) => {
      // Search filter
      const matchesSearch =
        project.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project.tag
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project.location
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (project.bnccCode?.toLowerCase() || '')
          .includes(searchQuery.toLowerCase()) ||
        (project.category?.toLowerCase() || '')
          .includes(searchQuery.toLowerCase()) ||
        (project.volume?.toLowerCase() || '')
          .includes(searchQuery.toLowerCase()) ||
        (project.segmento?.toLowerCase() || '')
          .includes(searchQuery.toLowerCase()) ||
        (project.tags || []).some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        // Campos específicos de audiovisual
        ((project as any).vestibular?.toLowerCase() || '')
          .includes(searchQuery.toLowerCase()) ||
        ((project as any).capitulo?.toLowerCase() || '')
          .includes(searchQuery.toLowerCase()) ||
        ((project as any).enunciado?.toLowerCase() || '')
          .includes(searchQuery.toLowerCase()) ||
        ((project as any).nomeCapitulo?.toLowerCase() || '')
          .includes(searchQuery.toLowerCase());

      // Filter by anos (usar normalização para comparar)
      const normalizeAnoForComparison = (ano: string): string => {
        if (!ano) return '';
        return ano
          .trim()
          .replace(/[°ºo]/gi, '°')
          .replace(/\s+/g, ' ')
          .toLowerCase();
      };
      
      const matchesAnos =
        selectedFilters.anos.length === 0 ||
        (project.location && selectedFilters.anos.some(selectedAno => 
          normalizeAnoForComparison(selectedAno) === normalizeAnoForComparison(project.location)
        ));

      // Filter by tags (Componente Curricular)
      const matchesTags =
        selectedFilters.tags.length === 0 ||
        selectedFilters.tags.some(
          (selectedTag) => {
            // Converter o tag selecionado para nome completo (já deve estar, mas garantir)
            const selectedTagFull = getComponentFullName(selectedTag);
            // Verifica se o tag está nas tags do projeto ou se o tag do projeto corresponde
            // Comparar usando nomes completos para garantir correspondência
            const projectTags = (project.tags || []).map(t => getComponentFullName(t));
            const projectTagFull = project.tag ? getComponentFullName(project.tag) : '';
            return (
              projectTags.includes(selectedTagFull) ||
              projectTagFull === selectedTagFull
            );
          }
        );

      // Filter by BNCC - normaliza espaços em branco
      const matchesBNCC =
        selectedFilters.bnccCodes.length === 0 ||
        (project.bnccCode && 
         project.bnccCode.trim() !== '' &&
         selectedFilters.bnccCodes.some(
           (selectedCode) => project.bnccCode?.trim() === selectedCode.trim()
         ));

      // Filter by segmentos - comparar usando nomes completos
      const matchesSegmentos =
        selectedFilters.segmentos.length === 0 ||
        (project.segmento && selectedFilters.segmentos.some(
          (selectedSegment) => {
            const selectedSegmentFull = getSegmentFullName(selectedSegment);
            const projectSegmentFull = getSegmentFullName(project.segmento || '');
            return projectSegmentFull === selectedSegmentFull;
          }
        ));

      // Filter by categorias
      const matchesCategorias =
        selectedFilters.categorias.length === 0 ||
        (project.category && selectedFilters.categorias.includes(project.category));

      // Filter by marcas
      // Filter by marcas - comparar usando nomes completos
      const matchesMarcas =
        selectedFilters.marcas.length === 0 ||
        (project.marca && selectedFilters.marcas.some(
          (selectedMarca) => {
            const selectedMarcaFull = getMarcaFullName(selectedMarca);
            const projectMarcaFull = getMarcaFullName(project.marca || '');
            return projectMarcaFull === selectedMarcaFull;
          }
        ));

      // Filter by tipo de objeto (OED only)
      const matchesTipoObjeto =
        selectedFilters.tipoObjeto.length === 0 ||
        (project.contentType === "OED" && 'tipoObjeto' in project &&
          (project as ODAFromExcel).tipoObjeto &&
          selectedFilters.tipoObjeto.includes(
            (project as ODAFromExcel).tipoObjeto!,
          ));

      // Filter by video category (Audiovisual only)
      const matchesVideoCategory =
        selectedFilters.videoCategory.length === 0 ||
        (project.videoCategory &&
          selectedFilters.videoCategory.includes(
            project.videoCategory,
          ));

      // Filter by SAMR
      const matchesSAMR =
        selectedFilters.samr.length === 0 ||
        (project.samr &&
          selectedFilters.samr.includes(project.samr));

      // Filter by volumes
      const matchesVolumes =
        selectedFilters.volumes.length === 0 ||
        (project.volume &&
          selectedFilters.volumes.includes(project.volume));

      // Filter by vestibular (Audiovisual only)
      const matchesVestibular =
        selectedFilters.vestibular.length === 0 ||
        (project.contentType === "Audiovisual" && 'vestibular' in project &&
          (project as any).vestibular &&
          selectedFilters.vestibular.includes((project as any).vestibular));

      // Filter by capitulo (Audiovisual only)
      const matchesCapitulo =
        selectedFilters.capitulo.length === 0 ||
        (project.contentType === "Audiovisual" && 'capitulo' in project &&
          (project as any).capitulo &&
          selectedFilters.capitulo.includes((project as any).capitulo));

      return (
        matchesSearch &&
        matchesAnos &&
        matchesTags &&
        matchesBNCC &&
        matchesSegmentos &&
        matchesCategorias &&
        matchesMarcas &&
        matchesTipoObjeto &&
        matchesVideoCategory &&
        matchesSAMR &&
        matchesVolumes &&
        matchesVestibular &&
        matchesCapitulo
      );
    },
  );

  // Calcular paginação
  // Grid: 3 linhas x 5 colunas (2xl) = 15 itens por página
  // List: 20 itens por página
  const itemsPerPage = viewMode === 'grid' ? 15 : 15;
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // Resetar para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchQuery, selectedFilters, contentTypeFilter, viewMode]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setCurrentPage("gallery");
    // Scroll instantâneo para o topo quando abrir um ODA
    window.scrollTo(0, 0);
  };

  // Garantir que sempre rola para o topo quando um projeto é selecionado
  useEffect(() => {
    if (selectedProject) {
      // Scroll instantâneo sem animação
      window.scrollTo(0, 0);
    }
  }, [selectedProject]);

  const handleBackToGallery = () => {
    setSelectedProject(null);
    setCurrentPage("gallery");
  };

  const handleNavigateToSettings = () => {
    setCurrentPage("settings");
    setSelectedProject(null);
  };

  const handleNavigateToFavorites = () => {
    setCurrentPage("favorites");
    setSelectedProject(null);
  };

  const handleNavigateToGallery = () => {
    setCurrentPage("gallery");
    setSelectedProject(null);
    setCurrentPageNumber(1);
  };

  const handleFilterChange = (
    category: string,
    value: string,
  ) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [category]: newValues,
      };
    });
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      anos: [],
      tags: [],
      bnccCodes: [],
      segmentos: [],
      categorias: [],
      marcas: [],
      tipoObjeto: [],
      videoCategory: [],
      samr: [],
      volumes: [],
      vestibular: [],
      capitulo: [],
    });
  };

  const handleContentTypeChange = (
    type: "Todos" | "Audiovisual" | "OED",
  ) => {
    setContentTypeFilter(type);
    // Clear filters when changing content type
    handleClearFilters();
  };

  // Listen for messages from home.html iframe to navigate to gallery
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'navigateToAcervo') {
        setCurrentPage('gallery');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Show home page
  if (currentPage === "home") {
    return (
      <div style={{ width: '100%', height: '100vh', border: 'none', overflow: 'hidden', position: 'relative' }}>
        <iframe
          src="/home.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            overflow: 'auto',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          title="Home - Acervo Digital"
          scrolling="yes"
          allow="fullscreen"
        />
      </div>
    );
  }

  // Show settings page
  if (currentPage === "settings") {
    return <ProfileSettingsPage onBack={handleBackToGallery} onNavigateToFavorites={() => setCurrentPage('favorites')} />;
  }

  // Show favorites page
  if (currentPage === "favorites") {
    return (
      <FavoritesPage
        onBack={handleBackToGallery}
        favorites={favorites}
        projects={projects}
        onProjectClick={handleProjectClick}
        onToggleFavorite={handleToggleFavorite}
        onNavigateToSettings={handleNavigateToSettings}
      />
    );
  }

  // If a project is selected, show the details page instead of the gallery
  if (selectedProject) {
    const currentProject = selectedProject; // Type guard
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToFavorites={handleNavigateToFavorites}
          onNavigateToGallery={handleNavigateToGallery}
          contentTypeFilter={contentTypeFilter}
          onContentTypeChange={handleContentTypeChange}
          hideSearch={true}
        />
        
        <ProjectDetailsPage
          project={currentProject}
          onBack={handleBackToGallery}
          isFavorite={Array.isArray(favorites) && favorites.some(id => Number(id) === Number(currentProject.id))}
          onToggleFavorite={handleToggleFavorite}
          allProjects={projects}
          onProjectClick={handleProjectClick}
          favorites={favorites}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateToSettings={handleNavigateToSettings}
        onNavigateToFavorites={handleNavigateToFavorites}
        onNavigateToGallery={handleNavigateToGallery}
        contentTypeFilter={contentTypeFilter}
        onContentTypeChange={handleContentTypeChange}
      />

      {/* Server Connection Error Alert */}
      {serverConnectionError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Erro de Conexão com o Servidor
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{serverConnectionError}</p>
                <div className="mt-3">
                  <p className="font-semibold">Para iniciar o servidor:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Abra um novo terminal</li>
                    <li>Execute: <code className="bg-red-100 px-2 py-1 rounded">npm run server:dev</code></li>
                    <li>Ou: <code className="bg-red-100 px-2 py-1 rounded">cd server && npm run dev</code></li>
                  </ol>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setServerConnectionError(null)}
                  className="text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Active Filters Display */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        {/* Active Filters Display */}
        {Object.values(selectedFilters).some(
          (arr: any) => (arr as string[]).length > 0,
        ) && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">
                Filtros ativos (
                {Object.values(selectedFilters).reduce(
                  (acc: number, arr: any) => acc + (arr as string[]).length,
                  0,
                )}
                )
              </span>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors"
              >
                Limpar todos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Active filter badges for each category */}
              {Object.entries(selectedFilters).map(
                ([category, values]) => {
                  const valuesArray = values as string[];
                  if (valuesArray.length === 0) return null;

                  return valuesArray.map((value) => {
                    let badgeColor =
                      "bg-purple-100 text-purple-700 border-purple-300";

                    if (category === "anos")
                      badgeColor =
                        "bg-blue-100 text-blue-700 border-blue-300";
                    else if (category === "tags")
                      badgeColor =
                        "bg-green-100 text-green-700 border-green-300";
                    else if (category === "bnccCodes")
                      badgeColor =
                        "bg-gray-100 text-gray-700 border-gray-300";
                    else if (category === "segmentos")
                      badgeColor =
                        "bg-orange-100 text-orange-700 border-orange-300";
                    else if (category === "marcas")
                      badgeColor =
                        "bg-indigo-100 text-indigo-700 border-indigo-300";
                    else if (category === "tipoObjeto")
                      badgeColor =
                        "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300";
                    else if (category === "videoCategory")
                      badgeColor =
                        "bg-cyan-100 text-cyan-700 border-cyan-300";
                    else if (category === "samr")
                      badgeColor =
                        "bg-amber-100 text-amber-700 border-amber-300";
                    else if (category === "volumes")
                      badgeColor =
                        "bg-rose-100 text-rose-700 border-rose-300";
                    else if (category === "vestibular")
                      badgeColor =
                        "bg-indigo-100 text-indigo-700 border-indigo-300";
                    else if (category === "capitulo")
                      badgeColor =
                        "bg-teal-100 text-teal-700 border-teal-300";

                    return (
                      <button
                        key={`${category}-${value}`}
                        onClick={() =>
                          handleFilterChange(category, value)
                        }
                        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border-2 shadow-sm hover:shadow-md ${badgeColor}`}
                      >
                        <span
                          className={
                            category === "bnccCodes"
                              ? "font-mono"
                              : ""
                          }
                        >
                          {value}
                        </span>
                        <X className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" />
                      </button>
                    );
                  });
                },
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Filter Sidebar - Desktop Only */}
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filterOptions}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            contentType={contentTypeFilter}
          />
        </div>

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          filters={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          contentType={contentTypeFilter}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
        />

        {/* Floating Filter Button (Mobile Only) */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden fixed bottom-24 right-6 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-primary/50"
        >
          <SlidersHorizontal className="w-6 h-6" />
          {Object.values(selectedFilters).some(
            (arr: any) => (arr as string[]).length > 0,
          ) && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-secondary text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg">
              {Object.values(selectedFilters).reduce(
                (acc: number, arr: any) => acc + (arr as string[]).length,
                0,
              )}
            </span>
          )}
        </button>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Hero / Welcome Banner */}
            {showWelcomeBanner && (
              <section className="mb-10">
                <div className="relative overflow-hidden bg-primary text-white shadow-md px-6 py-8 sm:px-10 sm:py-10" style={{ borderRadius: '12px' }}>
                  {/* Botão fechar */}
                  <button
                    type="button"
                    aria-label="Fechar mensagem de boas-vindas"
                    onClick={() => setShowWelcomeBanner(false)}
                    className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="max-w-2xl">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-4 text-white">
                      Bem-vindo ao Acervo Digital
                    </h1>
                    <p className="text-base sm:text-lg text-white/90 max-w-xl mb-2">
                      Explore centenas de Objetos Digitais de Aprendizagem e Videoaulas alinhados à BNCC.
                    </p>
                    <p className="text-sm sm:text-base text-white/80 max-w-xl">
                      Use os filtros inteligentes para encontrar o conteúdo perfeito para sua aula.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Content Type Selector */}
            <div className="mb-10">
              <h2 className="text-gray-700 font-semibold mb-4" style={{ fontSize: '16px' }}>
                Selecione o tipo de conteúdo
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() =>
                    handleContentTypeChange("Todos")
                  }
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-200 font-semibold border cursor-pointer ${
                    contentTypeFilter === "Todos"
                      ? "bg-secondary text-white border-secondary shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Todos</span>
                </button>
                <button
                  onClick={() =>
                    handleContentTypeChange("Audiovisual")
                  }
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-200 font-semibold border cursor-pointer ${
                    contentTypeFilter === "Audiovisual"
                      ? "bg-secondary text-white border-secondary shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Video className="w-5 h-5" />
                  <span>Audiovisual</span>
                </button>
                <button
                  onClick={() => handleContentTypeChange("OED")}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-200 font-semibold border cursor-pointer ${
                    contentTypeFilter === "OED"
                      ? "bg-secondary text-white border-secondary shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>Objeto Digital</span>
                </button>
              </div>
            </div>

            {/* Results count or empty state */}
            <div>
              <div className="mb-8 flex items-center justify-between">
                {filteredProjects.length > 0 && (
                  <p className="text-sm text-gray-500 font-semibold">
                    {filteredProjects.length}{" "}
                    {filteredProjects.length === 1
                      ? "resultado encontrado"
                      : "resultados encontrados"}
                  </p>
                )}
                
                {/* View Mode Toggle */}
                {filteredProjects.length > 0 && (
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Visualização em grade"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-xs font-semibold hidden sm:inline">Grade</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Visualização em lista"
                    >
                      <List className="w-4 h-4" />
                      <span className="text-xs font-semibold hidden sm:inline">Lista</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-8">
                {filteredProjects.length === 0 ? (
                  /* Empty State - No results */
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

                      <h3 className="mb-3 text-foreground">
                        Nenhum ODA encontrado
                      </h3>
                      <p className="text-muted-foreground max-w-md mb-8">
                        {searchQuery.trim() !== ""
                          ? `Não encontramos resultados para "${searchQuery}". Tente ajustar sua busca ou explore as recomendações abaixo.`
                          : "Não há ODAs que correspondam aos filtros selecionados. Tente remover alguns filtros ou explore as recomendações abaixo."}
                      </p>

                      {(searchQuery.trim() !== "" ||
                        Object.values(selectedFilters).some(
                          (arr: any) => (arr as string[]).length > 0,
                        )) && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            handleClearFilters();
                          }}
                          className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-[#013668] hover:shadow-md transition-all font-semibold flex items-center gap-2 shadow-sm text-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          Limpar e Explorar Tudo
                        </button>
                      )}
                    </div>
                    <div className="mt-12">
                      <h3 className="text-primary mb-6 px-2">
                        ODAs Recomendados
                      </h3>
                      <ProjectGrid
                        projects={projects.slice(0, 8)}
                        onProjectClick={handleProjectClick}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    </div>
                  </div>
                ) : (
                  /* Show results */
                  <>
                    <ProjectGrid
                      projects={paginatedProjects}
                      onProjectClick={handleProjectClick}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                      viewMode={viewMode}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPageNumber}
                        totalPages={totalPages}
                        onPageChange={setCurrentPageNumber}
                      />
                    )}

                    {/* Show similar ODAs when search is active */}
                    {searchQuery.trim() !== "" &&
                      filteredProjects.length > 0 && (
                        <div className="mt-12">
                          <h3 className="text-primary mb-6 px-2">
                            ODAs Semelhantes
                          </h3>
                          <ProjectGrid
                            projects={contentTypeFilteredProjects
                              .filter(
                                (p) =>
                                  !filteredProjects.find(
                                    (fp) => fp.id === p.id,
                                  ),
                              )
                              .slice(0, 8)}
                            onProjectClick={handleProjectClick}
                            favorites={favorites}
                            onToggleFavorite={
                              handleToggleFavorite
                            }
                            viewMode={viewMode}
                          />
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}