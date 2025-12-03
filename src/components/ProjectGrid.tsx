import React from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectListItem } from './ProjectListItem';

interface Project {
  id: number;
  title: string;
  tag: string;
  tagColor: string;
  location: string;
  image: string;
}

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  favorites?: number[];
  onToggleFavorite?: (projectId: number) => void;
  viewMode?: 'grid' | 'list';
}

export function ProjectGrid({ projects, onProjectClick, favorites = [], onToggleFavorite, viewMode = 'grid' }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
      </div>
    );
  }

  // Função helper para verificar se é favorito (normalizando IDs)
  const isFavorite = (projectId: number): boolean => {
    if (!Array.isArray(favorites) || favorites.length === 0) return false;
    const normalizedId = Number(projectId);
    return favorites.some(id => Number(id) === normalizedId);
  };

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-2 sm:gap-3">
        {projects.map((project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project)}
            isFavorite={isFavorite(project.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">{projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project)}
          isFavorite={isFavorite(project.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}