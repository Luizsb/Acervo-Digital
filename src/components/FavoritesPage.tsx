import React from 'react';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { ProjectGrid } from './ProjectGrid';
import { ODA } from '../services/odaService';

interface FavoritesPageProps {
  onBack: () => void;
  favorites: string[];
  projects: ODA[];
  onProjectClick: (project: ODA) => void;
  onToggleFavorite?: (projectId: string) => void;
}

export function FavoritesPage({ onBack, favorites, projects, onProjectClick, onToggleFavorite }: FavoritesPageProps) {
  const favoriteProjects = projects.filter(project => favorites.includes(project.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-destructive border-b-4 border-white/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-white hover:text-white/80 transition-all duration-300 group mb-4"
          >
            <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold">Voltar ao Acervo</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-xl rounded-3xl border-2 border-white/40 shadow-2xl">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-white mb-1">Meus Favoritos</h2>
              <p className="text-white/80 text-sm">
                {favoriteProjects.length} {favoriteProjects.length === 1 ? 'ODA favoritado' : 'ODAs favoritados'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {favoriteProjects.length > 0 ? (
          <ProjectGrid 
            projects={favoriteProjects}
            onProjectClick={onProjectClick}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative mb-8">
              <div className="p-8 bg-red-100 rounded-full">
                <Heart className="w-24 h-24 text-destructive" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-12 h-12 text-secondary animate-pulse" />
              </div>
            </div>
            
            <h3 className="mb-3 text-foreground">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              Adicione ODAs aos seus favoritos clicando no ícone de coração nos cards para acessá-los rapidamente depois.
            </p>
            
            <button
              onClick={onBack}
              className="px-8 py-4 bg-destructive text-white rounded-full hover:bg-destructive/90 hover:shadow-2xl transition-all font-bold flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              Explorar ODAs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
