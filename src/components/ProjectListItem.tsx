import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Heart, Clock, Video, Gamepad2, MapPin } from 'lucide-react';
import { getCurriculumColor, getComponentFullName } from '../utils/curriculumColors';
import { formatDuration } from '../utils/formatters';
import { resolveMacroformato } from '../utils/macroformato';
import { resourceTypeLabel } from '../utils/contentType';
import type { Project } from '../types/project';
import { ProjectContextMenu } from './ProjectContextMenu';

interface ProjectListItemProps {
  project: Project;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (projectId: number) => void;
}

export function ProjectListItem({ project, onClick, isFavorite = false, onToggleFavorite }: ProjectListItemProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const durationLabel = formatDuration(project.duration);
  const macro = resolveMacroformato(project.macroformato);
  const typeLabel = resourceTypeLabel(project);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu]);

  return (
    <div
      ref={itemRef}
      className="group cursor-pointer bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 relative"
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      <div className="catalog-list-item-inner">
        <div className="relative overflow-hidden bg-gray-100 thumbnail-list-item">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const defaultImage = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
              if (!target.src.includes(defaultImage)) {
                target.src = defaultImage;
              }
            }}
          />
        </div>

        {/* Content - Informações principais */}
        <div className="catalog-list-item-content">
          
          {/* Title + Favorite */}
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="catalog-list-item-title font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors flex-1 min-w-0"
              title={project.title}
            >
              {project.title}
            </h3>
            
            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(project.id);
                }}
                className={`flex-shrink-0 p-1.5 sm:p-2 rounded-[12px] shadow-sm border transition-all duration-200 hover:scale-110 ${
                  isFavorite
                    ? 'bg-destructive border-destructive'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'text-white fill-white' : 'text-gray-400'}`} />
              </button>
            )}
          </div>

          {/* Tags inline */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Subject Tag */}
            {project.tags && project.tags.length > 0 ? (
              <div
                title="Componente curricular"
                className={`inline-flex items-center px-2 py-0.5 rounded-[12px] text-xs font-semibold border ${getCurriculumColor(project.tags[0])}`}
              >
                {getComponentFullName(project.tags[0])}
              </div>
            ) : (
              <div
                title="Componente curricular"
                className={`inline-flex items-center px-2 py-0.5 rounded-[12px] text-xs font-semibold border ${getCurriculumColor(project.tag)}`}
              >
                {getComponentFullName(project.tag)}
              </div>
            )}

            {/* Marca badge - manter sigla, tooltip com nome completo */}
            {project.marca && (
              <div 
                className={`inline-flex items-center px-2 py-0.5 rounded-[12px] text-xs font-semibold border ${
                  project.marca === 'SPE' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                  project.marca === 'SAE' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  project.marca === 'CQT' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                  'bg-purple-100 text-purple-700 border-purple-200'
                }`}
                title="Marca"
              >
                {project.marca}
              </div>
            )}

            {macro && (
              <div title="Macroformato" className={macro.className}>
                {macro.label}
              </div>
            )}

          </div>

          {/* Info Row - Bottom */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            {/* Location/Year */}
            <div title="Ano / série" className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{project.location}</span>
            </div>

            {/* Category */}
            {typeLabel && (
              <>
                <span className="text-gray-300">•</span>
                <div
                  title="Tipo do recurso"
                  className="flex items-center gap-1"
                >
                  {project.contentType === 'Audiovisual' ? (
                    <Video className="w-4 h-4 text-gray-400" />
                  ) : project.contentType === 'OED' ? (
                    <Gamepad2 className="w-4 h-4 text-gray-400" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-medium">{typeLabel}</span>
                </div>
              </>
            )}

            {durationLabel && (
              <>
                <span className="text-gray-300">•</span>
                <div title="Duração" className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{durationLabel}</span>
                </div>
              </>
            )}

            {/* Volume - Mobile hidden */}
            {project.volume && (
              <span
                title="Volume"
                className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-[12px] bg-gray-100 border border-gray-200 text-xs font-bold"
              >
                Vol. {project.volume}
              </span>
            )}
          </div>
        </div>
      </div>

      {contextMenu && (
        <ProjectContextMenu
          project={project}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}