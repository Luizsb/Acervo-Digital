import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Heart, Clock, Video, Gamepad2, MapPin, Play } from 'lucide-react';
import { getCurriculumColor, getComponentFullName, getMarcaFullName } from '../utils/curriculumColors';
import { VideoThumbnail } from './VideoThumbnail';
import type { Project } from '../types/project';

interface ProjectListItemProps {
  project: Project;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (projectId: number) => void;
}

export function ProjectListItem({ project, onClick, isFavorite = false, onToggleFavorite }: ProjectListItemProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);

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
      <div className="flex flex-row items-start gap-3 sm:gap-4 p-2 sm:p-3">
        
        {/* Image - Tamanho aumentado para desktop */}
        <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-[12px] overflow-hidden bg-gray-100 thumbnail-list-item">
          {project.contentType === 'Audiovisual' && project.videoUrl ? (
            <VideoThumbnail
              videoUrl={project.videoUrl}
              fallbackImage={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // Fallback para imagem padrão se a thumb não existir
                const target = e.target as HTMLImageElement;
                const defaultImage = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
                if (!target.src.includes(defaultImage)) {
                  target.src = defaultImage;
                }
              }}
            />
          )}
          {/* Botão de play overlay para audiovisuais */}
          {project.contentType === 'Audiovisual' && project.videoUrl && (
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 flex items-center justify-center transition-all duration-300">
              <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-primary ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
        </div>

        {/* Content - Informações principais */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-4">
          
          {/* Title + Favorite */}
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors text-sm sm:text-base md:text-lg flex-1 min-w-0"
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
              <div className={`inline-flex items-center px-2 py-0.5 rounded-[12px] text-xs font-semibold border ${getCurriculumColor(project.tags[0])}`}>
                {getComponentFullName(project.tags[0])}
              </div>
            ) : (
              <div className={`inline-flex items-center px-2 py-0.5 rounded-[12px] text-xs font-semibold border ${getCurriculumColor(project.tag)}`}>
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
                title={getMarcaFullName(project.marca)}
              >
                {project.marca}
              </div>
            )}

            {/* BNCC Code */}
            {project.bnccCode && (
              <div className="inline-flex items-center px-2 py-0.5 rounded-[12px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 text-xs">
                {project.bnccCode}
              </div>
            )}
          </div>

          {/* Info Row - Bottom */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            {/* Location/Year */}
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="font-medium">{project.location}</span>
            </div>

            {/* Category */}
            {project.category && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  {project.contentType === 'Audiovisual' ? (
                    <Video className="w-3 h-3 text-gray-400" />
                  ) : project.contentType === 'OED' ? (
                    <Gamepad2 className="w-3 h-3 text-gray-400" />
                  ) : (
                    <BookOpen className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="font-medium">{project.category}</span>
                </div>
              </>
            )}

            {/* Duration - apenas para Vídeo Aula */}
            {project.duration && project.contentType === 'Audiovisual' && (project.category === 'Vídeo Aula' || project.videoCategory === 'Vídeo Aula') && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="font-medium">{project.duration}</span>
                </div>
              </>
            )}

            {/* Volume - Mobile hidden */}
            {project.volume && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-[12px] bg-gray-100 border border-gray-200 text-xs font-bold">
                {project.volume}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu de contexto */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Abrir ODA
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Abrir em nova guia usando window.open com a URL atual + hash do projeto
              const newWindow = window.open(window.location.href, '_blank');
              if (newWindow) {
                // Executar onClick após um pequeno delay para garantir que a nova janela carregou
                setTimeout(() => {
                  onClick();
                }, 100);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Abrir em nova guia
          </button>
        </div>
      )}
    </div>
  );
}