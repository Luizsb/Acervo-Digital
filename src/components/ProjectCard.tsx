import React from 'react';
import { BookOpen, Layers, Heart, Clock, Video, Gamepad2 } from 'lucide-react';
import { getCurriculumColor, getMarcaColor } from '../utils/odaColors';

interface Project {
  id: string;
  title: string;
  tag: string;
  tags?: string[];
  location: string;
  image: string;
  bnccCode?: string;
  bnccDescription?: string;
  category?: string;
  duration?: string;
  volume?: string;
  marca?: string;
  contentType?: string;
  samr?: string;
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (projectId: string) => void;
}

export function ProjectCard({ project, onClick, isFavorite = false, onToggleFavorite }: ProjectCardProps) {
  return (
    <div
      className="group cursor-pointer h-full"
    >
      {/* Card */}
      <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 hover:border-gray-300 h-full flex flex-col">
        
        <div className="relative flex-shrink-0" onClick={onClick}>
          {/* Project Image */}
          <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          
          {/* Volume badge */}
          {project.volume && (
            <div className="absolute top-3 right-3 bg-white px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 border border-gray-200">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-gray-700">{project.volume}</span>
            </div>
          )}

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(project.id);
              }}
              className={`absolute top-3 left-3 p-2 rounded-lg shadow-sm border transition-all duration-200 hover:scale-110 z-10 ${
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
          {/* Title */}
          <h3 
            className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors"
            title={project.title}
          >
            {project.title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags && project.tags.length > 0 ? (
              project.tags.slice(0, 3).map((tag, index) => (
                <div
                  key={index}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    index === 0 ? getCurriculumColor(tag) : 
                    index === 1 ? 'bg-secondary/10 text-secondary border-secondary/20' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {tag}
                </div>
              ))
            ) : (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getCurriculumColor(project.tag)}`}>
                {project.tag}
              </div>
            )}

            {/* Marca badge */}
            {project.marca && (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getMarcaColor(project.marca)}`}>
                {project.marca}
              </div>
            )}
          </div>

          {/* Category and Duration */}
          <div className="flex items-center gap-3 pt-2 mt-auto border-t border-gray-100">
            {project.category && (
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
            )}
            {project.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-600">{project.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}