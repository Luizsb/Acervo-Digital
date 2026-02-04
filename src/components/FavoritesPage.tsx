import React, { useState } from 'react';
import { ArrowLeft, Heart, Sparkles, User } from 'lucide-react';
import { ProjectGrid } from './ProjectGrid';
import { ProfileMenu } from './ProfileMenu';
import type { AuthUser } from '../contexts/AuthContext';
import type { Project } from '../types/project';

interface FavoritesPageProps {
  onBack: () => void;
  favorites: number[];
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onToggleFavorite?: (projectId: number) => void;
  onNavigateToSettings?: () => void;
  onNavigateToFavorites?: () => void;
  onLogout?: () => void;
  user?: AuthUser | null;
}

export function FavoritesPage({
  onBack,
  favorites,
  projects,
  onProjectClick,
  onToggleFavorite,
  onNavigateToSettings,
  onNavigateToFavorites,
  onLogout,
  user,
}: FavoritesPageProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // Garantir que favorites é um array e filtrar corretamente
  const validFavorites = Array.isArray(favorites) ? favorites.map(id => Number(id)) : [];
  const favoriteProjects = projects.filter(project => {
    const projectId = Number(project.id);
    return validFavorites.includes(projectId);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Back Button - aligned left */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-[20px] transition-all duration-300 border border-white/40 hover:border-white/60 font-semibold text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              
              <div className="h-8 w-px bg-white/30 hidden sm:block"></div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-xl rounded-xl border border-white/40 shadow-md flex items-center justify-center">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-white font-black tracking-tight" style={{ fontSize: '24px' }}>
                    Meus Favoritos
                  </h2>
                </div>
              </div>
            </div>

            {/* Right side - User button with dropdown */}
            <div className="flex items-center gap-3">
              {/* Count badge - mobile only */}
              <div className="sm:hidden">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-xl rounded-[20px] border border-white/40">
                  <span className="text-white font-bold text-sm">{favoriteProjects.length}</span>
                </div>
              </div>
              
              {/* Profile Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 group"
                >
                  <User className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                </button>

                {/* Profile Dropdown - reutiliza ProfileMenu */}
                {isProfileOpen && user && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-full mt-3 z-50">
                      <ProfileMenu
                        user={user}
                        onClose={() => setIsProfileOpen(false)}
                        onNavigateToSettings={() => onNavigateToSettings?.()}
                        onNavigateToFavorites={() => {
                          setIsProfileOpen(false);
                          onNavigateToFavorites?.();
                        }}
                        onLogout={() => onLogout?.()}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {favoriteProjects.length > 0 ? (
          <ProjectGrid 
            projects={favoriteProjects}
            onProjectClick={onProjectClick}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="relative mb-6">
              <div className="p-6 bg-red-50 rounded-full">
                <Heart className="w-16 h-16 text-secondary" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-secondary animate-pulse" />
              </div>
            </div>
            
            <h3 className="mb-2 text-foreground font-bold text-xl">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground max-w-md mb-6 text-sm">
              Adicione ODAs aos seus favoritos clicando no ícone de coração nos cards para acessá-los rapidamente depois.
            </p>
            
            <button
              onClick={onBack}
              className="px-6 py-3 bg-secondary text-white rounded-[20px] hover:bg-[#D43E2A] hover:shadow-md transition-all font-semibold flex items-center gap-2 shadow-sm text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Explorar ODAs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}