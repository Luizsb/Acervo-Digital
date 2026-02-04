import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { Navigation } from "./components/Navigation";
import { ProjectGrid } from "./components/ProjectGrid";
import { useAuth } from "./contexts/AuthContext";
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
import { apiFavoritesGet, apiFavoriteAdd, apiFavoriteRemove } from "./utils/api";
import { Pagination } from "./components/Pagination";
import { ScrollToTop } from "./components/ScrollToTop";
import { useProjectFilters } from "./hooks/useProjectFilters";
import { getInitialPageFromHash, getHashFromPage, type PageKey } from "./utils/hashRouting";

// Lazy load de páginas pesadas para reduzir bundle inicial
const ProjectDetailsPage = lazy(() =>
  import("./components/ProjectDetailsPage").then((m) => ({ default: m.ProjectDetailsPage }))
);
const ProfileSettingsPage = lazy(() =>
  import("./components/ProfileSettingsPage").then((m) => ({ default: m.ProfileSettingsPage }))
);
const FavoritesPage = lazy(() =>
  import("./components/FavoritesPage").then((m) => ({ default: m.FavoritesPage }))
);
const LoginPage = lazy(() =>
  import("./components/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("./components/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import("./components/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import("./components/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);

function PageLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <p className="text-primary font-semibold text-lg">Carregando...</p>
    </div>
  );
}

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
  const [currentPage, setCurrentPageState] = useState<PageKey>(getInitialPageFromHash);

  const setCurrentPage = (page: PageKey) => {
    setCurrentPageState(page);
    const hash = getHashFromPage(page);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash === "#" ? "#" : hash);
    }
  };

  // Ao carregar/atualizar a página, restaurar currentPage a partir do hash (ex.: F5 no acervo)
  useEffect(() => {
    const onHashChange = () => setCurrentPageState(getInitialPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const [returnToAfterLogin, setReturnToAfterLogin] = useState<"gallery" | "settings" | "favorites">("gallery");
  const { user, login, logout, register, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [odasFromExcel, setOdasFromExcel] = useState<ODAFromExcel[]>([]);
  const [audiovisualFromDB, setAudiovisualFromDB] = useState<ODAFromExcel[]>([]);
  const [loadingODAs, setLoadingODAs] = useState(true);
  const [loadingAudiovisual, setLoadingAudiovisual] = useState(true);
  const [serverConnectionError, setServerConnectionError] = useState<string | null>(null);
  const projectsLoading = loadingODAs || loadingAudiovisual;

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
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('ConnectionError') ||
            error?.message?.includes('ERR_CONNECTION_REFUSED') ||
            error?.name === 'TypeError') {
          setServerConnectionError(
            'Servidor backend não está rodando. Por favor, inicie o servidor em um terminal separado.'
          );
        }
      } finally {
        setLoadingODAs(false);
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
      } finally {
        setLoadingAudiovisual(false);
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const {
    filterOptions,
    selectedFilters,
    handleFilterChange,
    handleClearFilters,
    filteredProjects,
    contentTypeFilteredProjects,
  } = useProjectFilters(projects, contentTypeFilter, searchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  // Load favorites: from API when logged in, else from localStorage
  useEffect(() => {
    if (user) {
      apiFavoritesGet()
        .then((ids) => setFavorites(Array.isArray(ids) ? ids : []))
        .catch(() => setFavorites([]));
      return;
    }
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
      localStorage.removeItem("favorites");
      setFavorites([]);
    }
  }, [user]);

  // Toggle favorite (API quando logado, localStorage quando não)
  const handleToggleFavorite = (projectId: number) => {
    if (!projectId || isNaN(projectId)) {
      console.error('ID de projeto inválido:', projectId);
      return;
    }
    const normalizedProjectId = Number(projectId);

    if (user) {
      const isFavorite = Array.isArray(favorites) && favorites.some((id) => Number(id) === normalizedProjectId);
      setFavorites((prev) => {
        const current = Array.isArray(prev) ? prev.map(Number) : [];
        const next = isFavorite
          ? current.filter((id) => id !== normalizedProjectId)
          : [...current.filter((id) => id !== normalizedProjectId), normalizedProjectId];
        return Array.from(new Set(next));
      });
      if (isFavorite) {
        apiFavoriteRemove(normalizedProjectId).catch(() => {
          setFavorites((prev) => [...prev.filter((id) => id !== normalizedProjectId), normalizedProjectId]);
        });
      } else {
        apiFavoriteAdd(normalizedProjectId).catch(() => {
          setFavorites((prev) => prev.filter((id) => id !== normalizedProjectId));
        });
      }
      return;
    }

    setFavorites((prev) => {
      const currentFavorites = Array.isArray(prev) ? prev : [];
      const normalizedFavorites = currentFavorites.map((id) => Number(id));
      const isFavorite = normalizedFavorites.includes(normalizedProjectId);
      const uniqueFavorites = normalizedFavorites.filter((id) => id !== normalizedProjectId);
      const newFavorites = isFavorite ? uniqueFavorites : [...uniqueFavorites, normalizedProjectId];
      const finalFavorites = Array.from(new Set(newFavorites));
      try {
        localStorage.setItem("favorites", JSON.stringify(finalFavorites));
      } catch (error) {
        console.error('Erro ao salvar favoritos no localStorage:', error);
      }
      return finalFavorites;
    });
  };

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
    setSelectedProject(null);
    if (!user) {
      setReturnToAfterLogin("settings");
      setCurrentPage("login");
    } else {
      setCurrentPage("settings");
    }
  };

  const handleNavigateToFavorites = () => {
    setSelectedProject(null);
    if (!user) {
      setReturnToAfterLogin("favorites");
      setCurrentPage("login");
    } else {
      setCurrentPage("favorites");
    }
  };

  const handleNavigateToGallery = () => {
    setSelectedProject(null);
    setCurrentPageNumber(1);
    if (!user) {
      setReturnToAfterLogin("gallery");
      setCurrentPage("login");
    } else {
      setCurrentPage("gallery");
    }
  };

  const handleNavigateToLogin = () => {
    setReturnToAfterLogin("gallery");
    setCurrentPage("login");
    setSelectedProject(null);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage("home");
    setSelectedProject(null);
  };

  const handleNavigateToRegister = () => {
    setCurrentPage("register");
    setSelectedProject(null);
  };

  const handleBackToHome = () => {
    setSelectedProject(null);
    setCurrentPage("home");
  };

  const handleContentTypeChange = (type: "Todos" | "Audiovisual" | "OED") => {
    setContentTypeFilter(type);
    handleClearFilters();
  };

  // Da página inicial: ao tentar acessar o Acervo, exige login primeiro
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'navigateToAcervo') {
        if (user) {
          setCurrentPage('gallery');
        } else {
          setReturnToAfterLogin('gallery');
          setCurrentPage('login');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  // Se estiver em área que exige login (acervo, conta, favoritos) sem estar logado, redireciona para login
  // (não redireciona se estiver em forgot/reset)
  useEffect(() => {
    if (authLoading || user !== null) return;
    if (currentPage === "forgot" || currentPage === "reset") return;
    if (selectedProject) {
      setSelectedProject(null);
      setReturnToAfterLogin("gallery");
      setCurrentPage("login");
      return;
    }
    if (currentPage === "gallery" || currentPage === "settings" || currentPage === "favorites") {
      setReturnToAfterLogin(currentPage);
      setCurrentPage("login");
    }
  }, [authLoading, user, currentPage, selectedProject]);

  // Enquanto restaura sessão (localStorage), evita flash ou tela em branco (exceto home, login, register, forgot, reset)
  if (authLoading && !["home", "login", "register", "forgot", "reset"].includes(currentPage)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary font-semibold">Carregando...</p>
      </div>
    );
  }

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

  // Show login page
  if (currentPage === "login") {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage
          onBack={handleBackToHome}
          onLoginSuccess={() => {
            setCurrentPage(returnToAfterLogin);
            if (returnToAfterLogin === "gallery") setSelectedProject(null);
          }}
          login={login}
          onNavigateToRegister={handleNavigateToRegister}
          onNavigateToForgot={() => setCurrentPage("forgot")}
        />
      </Suspense>
    );
  }

  // Show register page
  if (currentPage === "register") {
    return (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage
          onBack={handleBackToHome}
          onRegisterSuccess={() => {
            setCurrentPage(returnToAfterLogin);
            if (returnToAfterLogin === "gallery") setSelectedProject(null);
          }}
          register={register}
          onNavigateToLogin={() => setCurrentPage("login")}
        />
      </Suspense>
    );
  }

  // Show forgot password page
  if (currentPage === "forgot") {
    return (
      <Suspense fallback={<PageLoader />}>
        <ForgotPasswordPage
          onBack={() => setCurrentPage("login")}
          onNavigateToLogin={() => setCurrentPage("login")}
        />
      </Suspense>
    );
  }

  // Show reset password page (token in URL hash)
  if (currentPage === "reset") {
    return (
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordPage
          onBack={() => setCurrentPage("login")}
          onSuccess={() => setCurrentPage("login")}
        />
      </Suspense>
    );
  }

  // Show settings page
  if (currentPage === "settings") {
    return (
      <Suspense fallback={<PageLoader />}>
        <ProfileSettingsPage onBack={handleBackToGallery} onNavigateToFavorites={() => setCurrentPage('favorites')} />
      </Suspense>
    );
  }

  // Show favorites page
  if (currentPage === "favorites") {
    return (
      <Suspense fallback={<PageLoader />}>
      <FavoritesPage
        onBack={handleBackToGallery}
        favorites={favorites}
        projects={projects}
        onProjectClick={handleProjectClick}
        onToggleFavorite={handleToggleFavorite}
        onNavigateToSettings={handleNavigateToSettings}
        onNavigateToFavorites={() => setCurrentPage("favorites")}
        onLogout={handleLogout}
        user={user}
      />
      </Suspense>
    );
  }

  // Proteção: se chegou aqui sem estar logado, mostrar login (evita tela em branco)
  if (!authLoading && !user) {
    return (
      <Suspense fallback={<PageLoader />}>
      <LoginPage
        onBack={handleBackToHome}
        onLoginSuccess={() => {
          setCurrentPage(returnToAfterLogin);
          if (returnToAfterLogin === "gallery") setSelectedProject(null);
        }}
login={login}
        onNavigateToForgot={() => setCurrentPage("forgot")}
      />
    </Suspense>
  );
  }

  // If a project is selected, show the details page instead of the gallery
  if (selectedProject) {
    const currentProject = selectedProject; // Type guard
    return (
      <Suspense fallback={<PageLoader />}>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToFavorites={handleNavigateToFavorites}
          onNavigateToGallery={handleNavigateToGallery}
          onNavigateToLogin={handleNavigateToLogin}
          contentTypeFilter={contentTypeFilter}
          onContentTypeChange={handleContentTypeChange}
          hideSearch={true}
          user={user}
          onLogout={handleLogout}
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
      </Suspense>
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
        onNavigateToLogin={handleNavigateToLogin}
        contentTypeFilter={contentTypeFilter}
        onContentTypeChange={handleContentTypeChange}
        user={user}
        onLogout={handleLogout}
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

            {/* Loading acervo ou resultados */}
            {projectsLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-primary font-semibold">Carregando acervo...</p>
                <p className="text-sm text-muted-foreground mt-1">Buscando ODAs e videoaulas</p>
              </div>
            ) : (
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
            )}
          </div>
        </main>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}