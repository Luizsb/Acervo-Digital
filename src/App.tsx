import React, { useState, useEffect, useCallback } from "react";
import { Navigation } from "./components/Navigation";
import { ProjectGrid } from "./components/ProjectGrid";
import { ProjectDetailsPage } from "./components/ProjectDetailsPage";
import { ProfileSettingsPage } from "./components/ProfileSettingsPage";
import { FavoritesPage } from "./components/FavoritesPage";
import { FilterSidebar } from "./components/FilterSidebar";
import { MobileFilterDrawer } from "./components/MobileFilterDrawer";
import { AuthPage } from "./components/AuthPage";
import {
  SearchX,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { BookOpen, Video, Gamepad2 } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { odaService, ODA, ODAFilters } from "./services/odaService";
import { favoriteService } from "./services/favoriteService";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [projects, setProjects] = useState<ODA[]>([]);
  const [selectedProject, setSelectedProject] = useState<ODA | null>(null);
  const [currentPage, setCurrentPage] = useState<
    "gallery" | "settings" | "favorites"
  >("gallery");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [contentTypeFilter, setContentTypeFilter] = useState<
    "Todos" | "Audiovisual" | "OED"
  >("Todos");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    anos: [] as string[],
    tags: [] as string[],
    bnccCodes: [] as string[],
    livros: [] as string[],
    categorias: [] as string[],
    marcas: [] as string[],
    tipoObjeto: [] as string[],
    videoCategory: [] as string[],
    samr: [] as string[],
    volumes: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar ODAs do backend
  const loadODAs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: ODAFilters = {
        search: searchQuery || undefined,
        contentType: contentTypeFilter !== "Todos" ? contentTypeFilter : undefined,
        anos: selectedFilters.anos.length > 0 ? selectedFilters.anos : undefined,
        tags: selectedFilters.tags.length > 0 ? selectedFilters.tags : undefined,
        bnccCodes: selectedFilters.bnccCodes.length > 0 ? selectedFilters.bnccCodes : undefined,
        livros: selectedFilters.livros.length > 0 ? selectedFilters.livros : undefined,
        categorias: selectedFilters.categorias.length > 0 ? selectedFilters.categorias : undefined,
        marcas: selectedFilters.marcas.length > 0 ? selectedFilters.marcas : undefined,
        tipoObjeto: selectedFilters.tipoObjeto.length > 0 ? selectedFilters.tipoObjeto : undefined,
        videoCategory: selectedFilters.videoCategory.length > 0 ? selectedFilters.videoCategory : undefined,
        samr: selectedFilters.samr.length > 0 ? selectedFilters.samr : undefined,
        volumes: selectedFilters.volumes.length > 0 ? selectedFilters.volumes : undefined,
      };

      const response = await odaService.getAll(filters);
      setProjects(response.data);
    } catch (err: any) {
      console.error("Erro ao carregar ODAs:", err);
      setError(err.message || "Erro ao carregar ODAs");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, contentTypeFilter, selectedFilters]);

  // Carregar favoritos do backend
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      const favs = await favoriteService.getAll();
      setFavorites(favs.map((f) => f.id));
    } catch (err) {
      console.error("Erro ao carregar favoritos:", err);
    }
  }, [isAuthenticated]);

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    if (isAuthenticated) {
      loadODAs();
    }
  }, [isAuthenticated, loadODAs]);

  // Carregar favoritos quando autenticado
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Toggle favorite
  const handleToggleFavorite = async (projectId: string) => {
    if (!isAuthenticated) {
      // Redirecionar para login ou mostrar modal
      return;
    }

    try {
      const isFavorite = favorites.includes(projectId);

      if (isFavorite) {
        await favoriteService.remove(projectId);
        setFavorites((prev) => prev.filter((id) => id !== projectId));
      } else {
        await favoriteService.add(projectId);
        setFavorites((prev) => [...prev, projectId]);
      }
    } catch (err: any) {
      console.error("Erro ao atualizar favorito:", err);
      alert(err.message || "Erro ao atualizar favorito");
    }
  };

  // Extrair valores únicos para filtros
  const filterOptions: {
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
  } = {
    anos: Array.from(new Set(projects.map((p) => p.location))).sort() as string[],
    tags: Array.from(
      new Set(
        projects
          .flatMap((p) => p.tags || [p.tag])
          .filter(Boolean) as string[]
      )
    ).sort() as string[],
    bnccCodes: Array.from(
      new Set(projects.map((p) => p.bnccCode).filter(Boolean) as string[])
    ).sort() as string[],
    livros: Array.from(
      new Set(projects.map((p) => p.livro).filter(Boolean) as string[])
    ).sort() as string[],
    categorias: Array.from(
      new Set(projects.map((p) => p.category).filter(Boolean) as string[])
    ).sort() as string[],
    marcas: Array.from(
      new Set(projects.map((p) => p.marca).filter(Boolean) as string[])
    ).sort() as string[],
    tipoObjeto: Array.from(
      new Set(
        projects
          .filter((p) => p.contentType === "OED")
          .map((p) => p.tipoObjeto)
          .filter(Boolean) as string[]
      )
    ).sort() as string[],
    videoCategory: Array.from(
      new Set(
        projects
          .filter((p) => p.contentType === "Audiovisual")
          .map((p) => p.videoCategory)
          .filter(Boolean) as string[]
      )
    ).sort() as string[],
    samr: Array.from(
      new Set(projects.map((p) => p.samr).filter(Boolean) as string[])
    ).sort() as string[],
    volumes: Array.from(
      new Set(projects.map((p) => p.volume).filter(Boolean) as string[])
    ).sort() as string[],
  };

  const handleProjectClick = (project: ODA) => {
    setSelectedProject(project);
    setCurrentPage("gallery");
    // Incrementar visualizações
    odaService.incrementView(project.id).catch(console.error);
  };

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

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[category as keyof typeof prev];
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
      livros: [],
      categorias: [],
      marcas: [],
      tipoObjeto: [],
      videoCategory: [],
      samr: [],
      volumes: [],
    });
  };

  const handleContentTypeChange = (
    type: "Todos" | "Audiovisual" | "OED"
  ) => {
    setContentTypeFilter(type);
    handleClearFilters();
  };

  // Mostrar loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar página de autenticação se não autenticado
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Show settings page
  if (currentPage === "settings") {
    return <ProfileSettingsPage onBack={handleBackToGallery} />;
  }

  // Show favorites page
  if (currentPage === "favorites") {
    const favoriteProjects = projects.filter((p) =>
      favorites.includes(p.id)
    );
    return (
      <FavoritesPage
        onBack={handleBackToGallery}
        favorites={favorites}
        projects={favoriteProjects}
        onProjectClick={handleProjectClick}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  }

  // If a project is selected, show the details page instead of the gallery
  if (selectedProject) {
    return (
      <ProjectDetailsPage
        project={selectedProject}
        onBack={handleBackToGallery}
        isFavorite={favorites.includes(selectedProject.id)}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateToSettings={handleNavigateToSettings}
        onNavigateToFavorites={handleNavigateToFavorites}
        contentTypeFilter={contentTypeFilter}
        onContentTypeChange={handleContentTypeChange}
      />

      {/* Mobile Active Filters Display */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        {(Object.values(selectedFilters) as string[][]).some((arr) => arr.length > 0) && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">
                Filtros ativos (
                {(Object.values(selectedFilters) as string[][]).reduce(
                  (acc, arr) => acc + arr.length,
                  0
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
              {Object.entries(selectedFilters).map(([category, values]) => {
                  const filterValues = values as string[];
                  if (filterValues.length === 0) return null;

                  return filterValues.map((value) => {
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
                        "bg-emerald-100 text-emerald-700 border-emerald-300";
                    else if (category === "livros")
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
                        "bg-gray-100 text-gray-700 border-gray-300";

                    return (
                      <button
                        key={`${category}-${value}`}
                      onClick={() => handleFilterChange(category, value)}
                        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border-2 shadow-sm hover:shadow-md ${badgeColor}`}
                      >
                        <span
                          className={
                          category === "bnccCodes" ? "font-mono" : ""
                          }
                        >
                          {value}
                        </span>
                      </button>
                    );
                  });
              })}
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
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-primary/50"
        >
          <SlidersHorizontal className="w-6 h-6" />
          {(Object.values(selectedFilters) as string[][]).some((arr) => arr.length > 0) && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-secondary text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg">
              {(Object.values(selectedFilters) as string[][]).reduce(
                (acc, arr) => acc + arr.length,
                0
              )}
            </span>
          )}
        </button>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Content Type Selector */}
            <div className="mb-10">
              <h2 className="text-base text-gray-700 font-semibold mb-4">
                Selecione o tipo de conteúdo
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleContentTypeChange("Todos")}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-200 font-semibold border ${
                    contentTypeFilter === "Todos"
                      ? "bg-secondary text-white border-secondary shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Todos</span>
                </button>
                <button
                  onClick={() => handleContentTypeChange("Audiovisual")}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-200 font-semibold border ${
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
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-200 font-semibold border ${
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
              <div className="mb-8">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando ODAs...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-destructive mb-4">{error}</p>
                    <button
                      onClick={loadODAs}
                      className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : projects.length > 0 ? (
                  <p className="text-sm text-gray-500 font-medium">
                    {projects.length}{" "}
                    {projects.length === 1
                      ? "resultado encontrado"
                      : "resultados encontrados"}
                  </p>
                ) : null}
              </div>
              <div className="mb-8">
                {!loading && !error && projects.length === 0 ? (
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
                        (Object.values(selectedFilters) as string[][]).some(
                          (arr) => arr.length > 0
                        )) && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            handleClearFilters();
                          }}
                          className="px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 hover:shadow-2xl transition-all font-bold flex items-center gap-3"
                        >
                          <Sparkles className="w-5 h-5" />
                          Limpar e Explorar Tudo
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Show results */
                  <>
                    {!loading && !error && (
                      <ProjectGrid
                        projects={projects}
                        onProjectClick={handleProjectClick}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
