import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { X, BookOpen, Clock, Share2, Check, ExternalLink, Star, Eye, Sparkles, Play, Book, FileText, Layers, Link as LinkIcon } from 'lucide-react';
import { getComponentFullName, getSegmentFullName } from '../utils/curriculumColors';

interface Project {
  id: number;
  title: string;
  tag: string;
  tags?: string[];
  tagColor: string;
  location: string;
  image: string;
  videoUrl?: string;
  bnccCode?: string;
  bnccDescription?: string;
  category?: string;
  duration?: string;
  volume?: string;
  segmento?: string;
  pagina?: string;
  contentType?: string;
  videoCategory?: string;
  description?: string;
  learningObjectives?: string[];
  pedagogicalResources?: string[];
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [isShared, setIsShared] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!project) return null;

  // Generate mock data for the ODA details
  const odaDetails = {
    description: project.description || undefined, // Será desenvolvido depois
    views: 1847,
    rating: 4.8,
    learningObjectives: project.learningObjectives || [], // Será desenvolvido depois
    pedagogicalResources: project.pedagogicalResources || [], // Será desenvolvido depois
    technicalRequirements: [
      "Navegador web atualizado (Chrome, Firefox, Safari)",
      "Conexão com internet (mínimo 2 Mbps)",
      "Dispositivos compatíveis: computador, tablet ou smartphone",
      "Não requer instalação de software adicional"
    ]
  };

  const handleShare = () => {
    console.log(`Sharing ODA "${project.title}" to: ${shareEmail}`);
    setIsShared(true);
    setTimeout(() => {
      setIsShared(false);
      setShareEmail("");
    }, 3000);
  };

  const handleCopyLink = () => {
    // Usar o link real do ODA (videoUrl) ou fallback para URL da página
    const url = project.videoUrl || `${window.location.origin}/oda/${project.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenInNewWindow = () => {
    // Abrir o link do ODA em nova janela
    if (project.videoUrl) {
      window.open(project.videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[1800px] h-[90vh] p-0 rounded-3xl flex flex-col overflow-hidden">
        <div className="relative flex-1 flex flex-col">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2.5 bg-white/95 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content - Two Column Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            {/* LEFT COLUMN - Video and Primary Info */}
            <div className="flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 overflow-y-auto">
              {/* Video Preview Section */}
              <div className="w-full mb-6">
                <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl">
                  {!showVideo ? (
                    <>
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback para imagem padrão se a thumb não existir
                          const target = e.target as HTMLImageElement;
                          const defaultImage = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
                          if (!target.src.includes(defaultImage)) {
                            target.src = defaultImage;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button
                          onClick={() => setShowVideo(true)}
                          className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl group"
                        >
                          <Play className="w-10 h-10 text-primary ml-1 group-hover:text-purple-600 transition-colors" fill="currentColor" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2">
                          {project.volume && (
                            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                              <span className="text-sm font-bold text-foreground">{project.volume}</span>
                            </div>
                          )}
                          {project.category && (
                            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                              <span className="text-sm font-bold text-primary">{project.category}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <iframe
                      src={project.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {project.tags && project.tags.length > 0 ? (
                  project.tags.map((tag, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white shadow-md ${
                        index === 0 ? project.tagColor : 
                        index === 1 ? 'bg-gradient-to-r from-purple-500 to-indigo-600' :
                        'bg-gradient-to-r from-cyan-500 to-blue-600'
                      }`}
                    >
                      {getComponentFullName(tag)}
                    </div>
                  ))
                ) : (
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white shadow-md ${project.tagColor}`}>
                    {getComponentFullName(project.tag)}
                  </div>
                )}
              </div>
              
              <DialogHeader className="mb-5">
                <DialogTitle className="text-left text-3xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <span title={project.title}>
                    {project.title}
                  </span>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detalhes do objeto digital de aprendizagem {project.title} para {project.location}
                </DialogDescription>
              </DialogHeader>

              {/* Info Row - Year, Duration, Book, Page */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border-2 border-primary/30 shadow-md">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm">{project.location}</span>
                </div>
                {project.duration && project.contentType === 'Audiovisual' && (project.category === 'Vídeo Aula' || project.videoCategory === 'Vídeo Aula') && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border-2 border-purple-300 shadow-md">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-sm">{project.duration}</span>
                  </div>
                )}
                {project.segmento && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100/90 to-indigo-100/90 backdrop-blur-sm border-2 border-blue-300 rounded-full shadow-md">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-sm text-blue-900">{getSegmentFullName(project.segmento)}</span>
                  </div>
                )}
                {/* Paginação - Oculto por enquanto, será desenvolvido depois */}
                {/* {project.pagina && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100/90 to-pink-100/90 backdrop-blur-sm border-2 border-purple-300 rounded-full shadow-md">
                    <FileText className="w-4 h-4 text-purple-700" />
                    <span className="font-bold text-sm text-purple-900">Págs {project.pagina}</span>
                  </div>
                )} */}
              </div>

              {/* BNCC Code */}
              {project.bnccCode && (
                <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border-2 border-primary/40 shadow-lg mb-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-bold text-primary mb-2 text-sm">
                        Código BNCC: {project.bnccCode}
                      </p>
                      {project.bnccDescription && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {project.bnccDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Row - Compact */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-blue-200 shadow-md">
                  <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="font-bold text-blue-900">{odaDetails.views}</p>
                  <p className="text-xs font-bold text-blue-700">Visualizações</p>
                </div>
                
                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-amber-200 shadow-md">
                  <Star className="w-5 h-5 text-amber-600 fill-amber-600 mx-auto mb-1" />
                  <p className="font-bold text-amber-900">{odaDetails.rating}</p>
                  <p className="text-xs font-bold text-amber-700">Avaliação</p>
                </div>
                
                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-green-200 shadow-md">
                  <Check className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="font-bold text-green-900">Ativo</p>
                  <p className="text-xs font-bold text-green-700">Status</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-auto pt-4">
                {project.videoUrl && (
                  <button 
                    onClick={handleOpenInNewWindow}
                    className="w-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 px-6 py-3.5 rounded-full text-white hover:shadow-2xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 font-bold"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Abrir em Outra Janela</span>
                  </button>
                )}
                <button 
                  onClick={handleCopyLink}
                  disabled={!project.videoUrl}
                  className={`w-full border-2 px-6 py-3.5 rounded-full transition-all hover:shadow-lg font-bold flex items-center justify-center gap-2 ${
                    project.videoUrl 
                      ? 'border-primary/40 hover:bg-primary/10 hover:border-primary bg-white/60 backdrop-blur-sm' 
                      : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <LinkIcon className="w-5 h-5" />
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>
                <button className="w-full border-2 border-primary/40 px-6 py-3.5 rounded-full hover:bg-primary/10 hover:border-primary transition-all hover:shadow-lg font-bold bg-white/60 backdrop-blur-sm">
                  Salvar nos Favoritos
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN - Details and Share */}
            <div className="flex flex-col bg-white p-8 overflow-y-auto">
              {/* Description - Oculto por enquanto, será desenvolvido depois */}
              {odaDetails.description && (
                <>
                  <div className="space-y-3 mb-6">
                    <h4 className="font-bold text-primary">Sobre este ODA</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {odaDetails.description}
                    </p>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6"></div>
                </>
              )}

              {/* Objectives - Oculto por enquanto, será desenvolvido depois */}
              {odaDetails.learningObjectives && odaDetails.learningObjectives.length > 0 && (
                <>
                  <div className="space-y-3 mb-6">
                    <h5 className="font-bold text-purple-700">Objetivos de Aprendizagem</h5>
                    <ul className="space-y-2">
                      {odaDetails.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-600 flex-shrink-0 mt-1.5"></div>
                          <span className="text-sm text-muted-foreground">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6"></div>
                </>
              )}

              {/* Pedagogical Resources - Oculto por enquanto, será desenvolvido depois */}
              {odaDetails.pedagogicalResources && odaDetails.pedagogicalResources.length > 0 && (
                <>
                  <div className="space-y-3 mb-6">
                    <h5 className="font-bold text-purple-700">Recursos Pedagógicos</h5>
                    <ul className="space-y-2">
                      {odaDetails.pedagogicalResources.map((resource, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-600 flex-shrink-0 mt-1.5"></div>
                          <span className="text-sm text-muted-foreground">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6"></div>
                </>
              )}

              {/* Technical Requirements */}
              <div className="space-y-3 p-5 bg-gradient-to-br from-primary/5 to-purple-50 rounded-xl border-2 border-primary/20 mb-6">
                <h5 className="font-bold">Requisitos Técnicos</h5>
                <ul className="space-y-2">
                  {odaDetails.technicalRequirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6"></div>

              {/* Share Section */}
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 font-bold">
                  <Share2 className="w-5 h-5 text-primary" />
                  Compartilhar
                </h5>
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Digite o e-mail para compartilhar"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                  />
                  <button 
                    onClick={handleShare}
                    disabled={!shareEmail || isShared}
                    className={`w-full px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-bold text-sm ${
                      isShared 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                        : 'bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isShared ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Compartilhado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-5 h-5" />
                        <span>Compartilhar ODA</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  O material será compartilhado com todas as informações pedagógicas e link de acesso
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
