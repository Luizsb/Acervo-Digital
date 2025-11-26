import React from 'react';
import { ProjectCard } from './ProjectCard';
import { ODA } from '../services/odaService';

interface ProjectGridProps {
  projects: ODA[];
  onProjectClick: (project: ODA) => void;
  favorites?: string[];
  onToggleFavorite?: (projectId: string) => void;
}

export function ProjectGrid({ projects, onProjectClick, favorites = [], onToggleFavorite }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project)}
          isFavorite={favorites.includes(project.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}