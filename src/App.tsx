import React, { useState, useEffect, Suspense, lazy } from "react";
import { Navigation } from "./components/Navigation";
import { useAuth } from "./contexts/AuthContext";
import { FilterSidebar } from "./components/FilterSidebar";
import "./components/AcervoLoading.css";
import { MobileFilterDrawer } from "./components/MobileFilterDrawer";
import { MobileActiveFilters, countActiveFilters } from "./components/MobileActiveFilters";
import { WelcomeBanner } from "./components/WelcomeBanner";
import { ContentTypeSelector, type ContentTypeFilter } from "./components/ContentTypeSelector";
import { GalleryResults, type GalleryViewMode } from "./components/GalleryResults";
import { SlidersHorizontal } from "lucide-react";
import type { Project } from "./types/project";
import { ScrollToTop } from "./components/ScrollToTop";
import { useProjectFilters } from "./hooks/useProjectFilters";
import { useGalleryPageSize } from "./hooks/useGalleryPageSize";
import { useCatalog } from "./hooks/useCatalog";
import { useFavorites } from "./hooks/useFavorites";
import {
  getInitialPageFromHash,
  getHashFromPage,
  getHashForResource,
  getResourceCodeFromHash,
  type PageKey,
} from "./utils/hashRouting";
import { startOnboardingIfNeeded } from "./utils/onboarding";
import { isAdminRole } from "./utils/catalogVisibility";
import { isSupabaseBackend } from "./config/backend";
import { CatalogLoadError } from "./components/CatalogLoadError";

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
const NotFoundPage = lazy(() =>
  import("./components/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);
const ForgotPasswordPage = lazy(() =>
  import("./components/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import("./components/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);
const AdminReviewPage = lazy(() =>
  import("./components/AdminReviewPage").then((m) => ({ default: m.AdminReviewPage }))
);

function PageLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <p className="text-primary font-semibold text-lg">Carregando...</p>
    </div>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPageState] = useState<PageKey>(getInitialPageFromHash);

  // Código do recurso pedido pela URL (#/recurso/<codigo>) aguardando o catálogo carregar.
  const [pendingResourceCode, setPendingResourceCode] = useState<string | null>(
    getResourceCodeFromHash
  );
  // Link de recurso que o catálogo carregado não tem: vira a página 404.
  const [missingResourceCode, setMissingResourceCode] = useState<string | null>(null);

  const setCurrentPage = (page: PageKey) => {
    setCurrentPageState(page);
    const hash = getHashFromPage(page);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash === "#" ? "#" : hash);
    }
  };

  // Ao carregar/atualizar a página, restaurar a rota a partir do hash (ex.: F5 ou link compartilhado)
  useEffect(() => {
    const onLocationChange = () => {
      setMissingResourceCode(null);
      setCurrentPageState(getInitialPageFromHash());
      const code = getResourceCodeFromHash();
      if (code) {
        setPendingResourceCode(code);
      } else {
        setPendingResourceCode(null);
        setSelectedProject(null);
      }
    };
    window.addEventListener("hashchange", onLocationChange);
    window.addEventListener("popstate", onLocationChange);
    return () => {
      window.removeEventListener("hashchange", onLocationChange);
      window.removeEventListener("popstate", onLocationChange);
    };
  }, []);
  const [returnToAfterLogin, setReturnToAfterLogin] = useState<"gallery" | "settings" | "favorites" | "review">("gallery");
  const { user, login, logout, loading: authLoading } = useAuth();
  const catalog = useCatalog(user, authLoading);
  const projects = catalog.projects;
  const projectsLoading = catalog.loading;
  const { favorites, isFavorite, toggleFavorite: handleToggleFavorite } = useFavorites(user);

  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>("Todos");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const {
    filterOptions,
    selectedFilters,
    handleFilterChange,
    handleClearFilters,
    filteredProjects,
    contentTypeFilteredProjects,
  } = useProjectFilters(projects, contentTypeFilter, searchQuery);
  const activeFilterCount = countActiveFilters(selectedFilters);
  const [viewMode, setViewMode] = useState<GalleryViewMode>("grid");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  // Onboarding (tour guiado) no primeiro acesso à galeria
  useEffect(() => {
    if (currentPage !== "gallery") return;
    if (projectsLoading) return;
    startOnboardingIfNeeded();
  }, [currentPage, projectsLoading]);

  // Link compartilhado (#/recurso/<codigo>): abre o recurso assim que o catálogo chega.
  useEffect(() => {
    if (!pendingResourceCode) return;
    if (projects.length === 0) return;

    const wanted = pendingResourceCode.trim().toUpperCase();
    const found = projects.find(
      (project) => (project.codigoODA || "").trim().toUpperCase() === wanted
    );
    if (found) {
      setSelectedProject(found);
      setCurrentPageState("gallery");
    } else {
      setMissingResourceCode(pendingResourceCode.trim());
      setCurrentPageState("notFound");
    }
    // Resolvido ou inexistente: em ambos os casos a URL deixa de ficar pendente.
    setPendingResourceCode(null);
  }, [pendingResourceCode, projects]);

  // Mantém a URL em sincronia com o recurso aberto, permitindo compartilhar o link.
  useEffect(() => {
    const code = selectedProject?.codigoODA?.trim();
    const desired = code ? getHashForResource(code) : getHashFromPage(currentPage);
    if (window.location.hash !== desired) {
      window.history.replaceState(null, "", desired);
    }
  }, [selectedProject, currentPage]);

  const itemsPerPage = useGalleryPageSize(viewMode);
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const startIndex = (currentPageNumber - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  // Resetar para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchQuery, selectedFilters, contentTypeFilter, viewMode]);

  useEffect(() => {
    if (currentPageNumber > totalPages) {
      setCurrentPageNumber(totalPages);
    }
  }, [currentPageNumber, totalPages]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentPageState("gallery");
    setPendingResourceCode(null);

    // Entrada própria no histórico: o botão voltar do navegador retorna à galeria.
    const code = project?.codigoODA?.trim();
    const desired = code ? getHashForResource(code) : getHashFromPage("gallery");
    if (window.location.hash !== desired) {
      window.history.pushState(null, "", desired);
    }

    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (selectedProject) window.scrollTo(0, 0);
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

  const handleNavigateToReview = () => {
    setSelectedProject(null);
    if (!user) {
      setReturnToAfterLogin("review");
      setCurrentPage("login");
    } else if (!isAdminRole(user.role)) {
      setCurrentPage("gallery");
    } else {
      setCurrentPage("review");
    }
  };

  const handleNavigateToLogin = () => {
    setReturnToAfterLogin("gallery");
    setCurrentPage("login");
    setSelectedProject(null);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage("login");
    setSelectedProject(null);
  };

  const handleLoginSuccess = () => {
    setSelectedProject(null);
    setReturnToAfterLogin("gallery");
    setCurrentPage("gallery");
  };

  // Entrada pelo login; usuários com sessão restaurada seguem para o destino.
  useEffect(() => {
    if (authLoading) return;
    if (user && currentPage === "login") {
      const next = returnToAfterLogin === "review" ? "gallery" : returnToAfterLogin;
      setCurrentPage(next);
    }
  }, [authLoading, user, currentPage, returnToAfterLogin]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (currentPage === "review" && !isAdminRole(user.role)) {
      setCurrentPage("gallery");
    }
  }, [authLoading, user, currentPage]);

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
    if (currentPage === "gallery" || currentPage === "settings" || currentPage === "favorites" || currentPage === "review") {
      setReturnToAfterLogin(currentPage);
      setCurrentPage("login");
    }
  }, [authLoading, user, currentPage, selectedProject]);

  // Enquanto restaura sessão (localStorage), evita flash ou tela em branco.
  if (authLoading && !["login", "register", "forgot", "reset", "notFound"].includes(currentPage)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary font-semibold">Carregando...</p>
      </div>
    );
  }

  if (currentPage === "login" || currentPage === "register") {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage onLoginSuccess={handleLoginSuccess} login={login} />
      </Suspense>
    );
  }

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

  // Token de redefinição vem no hash
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

  if (currentPage === "notFound") {
    return (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage
          missingResourceCode={missingResourceCode}
          onGoToGallery={() => {
            setMissingResourceCode(null);
            setSelectedProject(null);
            setCurrentPage("gallery");
          }}
        />
      </Suspense>
    );
  }

  if (currentPage === "review") {
    if (!isAdminRole(user?.role)) {
      return <PageLoader />;
    }
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminReviewPage onBack={handleBackToGallery} user={user} />
      </Suspense>
    );
  }

  if (currentPage === "settings") {
    return (
      <Suspense fallback={<PageLoader />}>
        <ProfileSettingsPage onBack={handleBackToGallery} onNavigateToFavorites={() => setCurrentPage('favorites')} />
      </Suspense>
    );
  }

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
          onNavigateToReview={handleNavigateToReview}
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
        <LoginPage onLoginSuccess={handleLoginSuccess} login={login} />
      </Suspense>
    );
  }

  const navigation = (hideSearch: boolean) => (
    <Navigation
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNavigateToSettings={handleNavigateToSettings}
      onNavigateToFavorites={handleNavigateToFavorites}
      onNavigateToReview={handleNavigateToReview}
      onNavigateToGallery={handleNavigateToGallery}
      onNavigateToLogin={handleNavigateToLogin}
      contentTypeFilter={contentTypeFilter}
      onContentTypeChange={setContentTypeFilter}
      hideSearch={hideSearch}
      user={user}
      onLogout={handleLogout}
    />
  );

  if (selectedProject) {
    return (
      <Suspense fallback={<PageLoader />}>
        <div className="min-h-screen bg-background flex flex-col">
          {navigation(true)}
          <ProjectDetailsPage
            project={selectedProject}
            onBack={handleBackToGallery}
            isFavorite={isFavorite(selectedProject.id)}
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
    <div className="acervo-app-shell">
      <div className="acervo-app-header">{navigation(false)}</div>

      {catalog.error && (
        <CatalogLoadError
          kind={catalog.error}
          isLocalBackend={!isSupabaseBackend()}
          onRetry={catalog.retry}
          onDismiss={catalog.dismissError}
        />
      )}

      <MobileActiveFilters
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <div className="acervo-app-body">
        {/* Filter Sidebar - permanece visível enquanto o grid rola */}
        <div className="acervo-app-sidebar">
          <FilterSidebar
            filters={filterOptions}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            contentType={contentTypeFilter}
            loading={projectsLoading}
          />
        </div>

        <MobileFilterDrawer
          filters={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          contentType={contentTypeFilter}
          loading={projectsLoading}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
        />

        <main className="acervo-app-main">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <WelcomeBanner />
            <ContentTypeSelector value={contentTypeFilter} onChange={setContentTypeFilter} />
            <GalleryResults
              loading={projectsLoading}
              results={filteredProjects}
              pageResults={paginatedProjects}
              recommended={projects}
              sameContentType={contentTypeFilteredProjects}
              searchQuery={searchQuery}
              hasActiveFilters={activeFilterCount > 0}
              onClearSearchAndFilters={() => {
                setSearchQuery("");
                handleClearFilters();
              }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              currentPage={currentPageNumber}
              totalPages={totalPages}
              onPageChange={setCurrentPageNumber}
              favorites={favorites}
              onProjectClick={handleProjectClick}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={() => setIsMobileFilterOpen(true)}
        className="acervo-fab-filter"
        aria-label="Abrir filtros"
        title="Filtros"
      >
        <SlidersHorizontal className="w-6 h-6" />
        {activeFilterCount > 0 ? (
          <span className="acervo-fab-filter-badge">{activeFilterCount}</span>
        ) : null}
      </button>
      <ScrollToTop />
    </div>
  );
}
