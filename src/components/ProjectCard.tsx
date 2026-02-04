import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Layers, Heart, Clock, Video, Gamepad2, Play } from 'lucide-react';
import { getCurriculumColor, getComponentFullName, getMarcaFullName } from '../utils/curriculumColors';
import { VideoThumbnail } from './VideoThumbnail';
import type { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (projectId: number) => void;
}

export function ProjectCard({ project, onClick, isFavorite = false, onToggleFavorite }: ProjectCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleOpenInNewTab = () => {
    onClick();
    // Simular abertura em nova guia usando window.open
    // Como não temos URL real, vamos apenas executar o onClick normalmente
    // O usuário pode usar Ctrl+Click ou botão do meio do mouse
    setContextMenu(null);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
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
      ref={cardRef}
      className="group cursor-pointer h-full relative"
      onContextMenu={handleContextMenu}
    >
      {/* Card */}
      <div className="relative bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300 h-full flex flex-col">
        
        <div className="relative flex-shrink-0" onClick={onClick}>
          {/* Project Image */}
          <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 relative">
            {project.contentType === 'Audiovisual' && project.videoUrl ? (
              <VideoThumbnail
                videoUrl={project.videoUrl}
                fallbackImage={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-primary ml-0.5" fill="currentColor" />
                </div>
              </div>
            )}
          </div>
          
          {/* Volume badge */}
          {project.volume && (
            <div className="absolute top-3 right-3 bg-white px-2.5 py-1.5 rounded-[20px] shadow-sm flex items-center gap-1.5 border border-gray-200">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-gray-700">{project.volume}</span>
            </div>
          )}

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(project.id);
              }}
              className={`absolute top-3 left-3 p-2 rounded-[20px] shadow-sm border transition-all duration-200 hover:scale-110 z-10 ${
                isFavorite
                  ? 'bg-secondary border-secondary shadow-secondary/20'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 transition-all ${isFavorite ? 'text-white fill-white' : 'text-gray-400'}`} />
            </button>
          )}
        </div>

        <div className="relative p-5 space-y-3 flex-1 flex flex-col" onClick={onClick}>
          {/* Title - Fixed height to ensure consistency */}
          <h3 
            style={{ fontSize: '24px' }} 
            className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[3.5rem]"
            title={project.title}
          >
            {project.title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {/* Subject Tags */}
            {project.tags && project.tags.length > 0 ? (
              project.tags.slice(0, 3).map((tag, index) => (
                <div
                  key={index}
                  className={`inline-flex items-center px-2.5 py-1 rounded-[20px] text-xs font-semibold border ${getCurriculumColor(tag)}`}
                >
                  {getComponentFullName(tag)}
                </div>
              ))
            ) : (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-[20px] text-xs font-semibold border ${getCurriculumColor(project.tag)}`}>
                {getComponentFullName(project.tag)}
              </div>
            )}

            {/* Marca badge - manter sigla, tooltip com nome completo */}
            {project.marca && (
              <div 
                className={`inline-flex items-center px-2.5 py-1 rounded-[20px] text-xs font-semibold border ${
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

            {/* BNCC Code Badge */}
            {project.bnccCode && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-[20px] text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                {project.bnccCode}
              </div>
            )}

            {/* SAMR Badge */}
            {project.samr && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-[20px] text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                {project.samr}
              </div>
            )}
          </div>

          {/* Category, Duration and Year */}
          <div className="flex items-center gap-3 pt-2 mt-auto border-t border-gray-100 flex-wrap">
            {/* Year/Location */}
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">{project.location}</span>
            </div>

            {project.category && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  {project.contentType === 'Audiovisual' ? (
                    <Video className="w-3.5 h-3.5 text-gray-400" />
                  ) : project.contentType === 'OED' ? (
                    <Gamepad2 className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span className="text-xs font-medium text-gray-600">{project.category}</span>
                </div>
              </>
            )}
            {project.duration && project.contentType === 'Audiovisual' && (project.category === 'Vídeo Aula' || project.videoCategory === 'Vídeo Aula') && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">{project.duration}</span>
                </div>
              </>
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