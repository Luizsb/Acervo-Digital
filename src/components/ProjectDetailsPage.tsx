import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, Check, ExternalLink, Eye, Sparkles, Play, Book, FileText, ArrowLeft, Heart, Link as LinkIcon, Settings, Download, Layers } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { getCurriculumColor, getComponentFullName, getSegmentFullName, getMarcaFullName } from '../utils/curriculumColors';
import { ScrollToTop } from './ScrollToTop';

const DEFAULT_TECHNICAL_REQUIREMENTS = "Navegador web atualizado (Chrome, Firefox, Safari)\nConexão com internet (mínimo 2 Mbps)\nDispositivos compatíveis: computador, tablet ou smartphone\nNão requer instalação de software adicional";

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
  marca?: string;
  contentType?: string;
  videoCategory?: string;
  samr?: string;
  tipoObjeto?: string;
  description?: string;
  learningObjectives?: string[];
  pedagogicalResources?: string[];
  technicalRequirements?: string;
  metodologiaPdfUrl?: string;
  status?: string;
  codigoODA?: string;
}

interface ProjectDetailsPageProps {
  project: Project;
  onBack: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (projectId: number) => void;
  allProjects?: Project[];
  onProjectClick?: (project: Project) => void;
  favorites?: number[];
}

export function ProjectDetailsPage({ project, onBack, isFavorite, onToggleFavorite, allProjects = [], onProjectClick, favorites = [] }: ProjectDetailsPageProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Garantir que sempre rola para o topo quando a página de detalhes é aberta (sem animação)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project.id]);

  // Mock data for demonstration
  const odaDetails = {
    views: "1.245",
    lastUpdate: "15 de novembro de 2024",
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

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(project.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-[20px] transition-all font-semibold text-foreground shadow-sm hover:shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Acervo</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Video and Primary Info */}
          <div className="flex flex-col space-y-6">
            {/* Video Preview Section */}
            <div className="w-full">
              <div className="relative aspect-video w-full bg-black rounded-[20px] overflow-hidden shadow-lg">
                {/* Verificar se é videoaula para mostrar o player */}
                {(() => {
                  const isVideoAula = project.contentType === 'Audiovisual' && 
                    (project.category === 'Vídeo Aula' || project.videoCategory === 'Vídeo Aula');
                  
                  if (isVideoAula && showVideo) {
                    // Mostrar iframe do vídeo para videoaulas
                    return (
                      <iframe
                        src={project.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  } else {
                    // Mostrar imagem (com ou sem botão de play dependendo se é videoaula)
                    return (
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
                        {/* Botão de play apenas para videoaulas */}
                        {isVideoAula && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <button
                              onClick={() => setShowVideo(true)}
                              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg group"
                            >
                              <Play className="w-10 h-10 text-primary ml-1 group-hover:text-secondary transition-colors" fill="currentColor" />
                            </button>
                          </div>
                        )}
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="flex items-center gap-3">
                            {project.volume && (
                              <div className="bg-white px-3 py-1.5 rounded-[20px] shadow-md">
                                <span className="text-sm font-bold text-foreground">{project.volume}</span>
                              </div>
                            )}
                            {project.category && (
                              <div className="bg-white px-3 py-1.5 rounded-[20px] shadow-md">
                                <span className="text-sm font-bold text-primary">{project.category}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Card with Info */}
            <div className="bg-white border-2 border-gray-200 rounded-[20px] p-8 shadow-md space-y-6">
              {/* Tags Row - Subjects and Marca */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Disciplina Tags - Reduced size */}
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.map((tag, index) => (
                      <div
                        key={index}
                        className={`inline-flex items-center px-2.5 py-1 rounded-[12px] text-xs font-semibold border shadow-sm ${getCurriculumColor(tag)}`}
                      >
                        {getComponentFullName(tag)}
                      </div>
                    ))
                  ) : (
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-[12px] text-xs font-semibold border shadow-sm ${getCurriculumColor(project.tag)}`}>
                      {getComponentFullName(project.tag)}
                    </div>
                  )}
                  {project.marca && (
                    <div 
                      className={`inline-flex items-center px-2.5 py-1 rounded-[12px] text-xs font-semibold border shadow-sm cursor-pointer ${
                        project.marca === 'SPE' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                        project.marca === 'SAE' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        project.marca === 'CQT' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                        'bg-indigo-100 text-indigo-700 border-indigo-200'
                      }`}
                      title={getMarcaFullName(project.marca)}
                    >
                      {project.marca}
                    </div>
                  )}
                </div>

                {/* Stats - Views and Status (Compact) */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-[12px] border border-gray-200">
                    <Eye className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-bold text-foreground">{odaDetails.views}</span>
                  </div>
                  
                  {project.status && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-[12px] border border-gray-200">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-bold text-foreground">{project.status}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <h1 
                style={{ fontSize: '20px' }} 
                className="text-primary font-extrabold leading-tight"
                title={project.title}
              >
                {project.title}
              </h1>

              {/* Info Row - Year, Duration, Book, Page - Reduced size */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-[12px] border border-gray-200 shadow-sm">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold">{project.location}</span>
                </div>
                {project.duration && project.contentType === 'Audiovisual' && (project.category === 'Vídeo Aula' || project.videoCategory === 'Vídeo Aula') && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-[12px] border border-gray-200 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-xs font-semibold">{project.duration}</span>
                  </div>
                )}
                {project.segmento && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-[12px] shadow-sm">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">{getSegmentFullName(project.segmento)}</span>
                  </div>
                )}
                {/* Paginação - Oculto por enquanto, será desenvolvido depois */}
                {/* {project.pagina && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-[12px] shadow-sm">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700">Págs {project.pagina}</span>
                  </div>
                )} */}
              </div>

              {/* SAMR Badge - Reduced size */}
              {project.samr && (() => {
                // Função para obter a descrição do SAMR baseado no nível
                const getSamrDescription = (samr: string): string => {
                  const normalized = samr.trim().toLowerCase();
                  
                  if (normalized.includes('substituição') || normalized.includes('substituicao')) {
                    return 'Este ODA está classificado no nível "Substituição" da escala SAMR, indicando que a tecnologia está sendo usada para substituir uma ferramenta tradicional sem alterar a funcionalidade da tarefa.';
                  }
                  if (normalized.includes('ampliação') || normalized.includes('ampliacao')) {
                    return 'Este ODA está classificado no nível "Ampliação" da escala SAMR, indicando que a tecnologia substitui uma ferramenta tradicional, porém acrescenta melhorias funcionais que enriquecem a tarefa.';
                  }
                  if (normalized.includes('modificação') || normalized.includes('modificacao')) {
                    return 'Este ODA está classificado no nível "Modificação" da escala SAMR, indicando que a tecnologia permite redesenhar de forma significativa a tarefa, alterando como ela é realizada e aprofundando a aprendizagem.';
                  }
                  if (normalized.includes('redefinição') || normalized.includes('redefinicao')) {
                    return 'Este ODA está classificado no nível "Redefinição" da escala SAMR, indicando que a tecnologia possibilita criar tarefas totalmente novas, que não seriam possíveis sem o uso desses recursos digitais.';
                  }
                  
                  // Fallback para texto genérico se não encontrar correspondência
                  return `Este ODA está classificado no nível "${project.samr}" da escala SAMR, indicando o grau de integração tecnológica na experiência de aprendizagem.`;
                };

                return (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-[20px] shadow-sm">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-amber-900 mb-1 text-sm">
                          Escala SAMR: {project.samr}
                        </p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          {getSamrDescription(project.samr)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* BNCC Code - Com código e habilidade (sem código duplicado no texto) */}
              {project.bnccCode && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 p-4 rounded-[20px] shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-500 p-2 rounded-[12px]">
                      <Sparkles className="w-4 h-4 text-white flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-indigo-900 mb-1.5 text-sm">
                        Código BNCC: <span className="font-mono bg-white px-2 py-0.5 rounded-[12px] border border-indigo-200 text-xs">{project.bnccCode}</span>
                      </p>
                      {project.bnccDescription && (() => {
                        // Remover código do início do texto da habilidade
                        // Remove padrões como: "(EF04LP10) ", "EF04LP10 - ", "EF04LP10 ", etc.
                        let habilidadeTexto = project.bnccDescription;
                        if (project.bnccCode) {
                          // Escapar caracteres especiais do código para regex
                          const codigoEscaped = project.bnccCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                          // Remover padrões: "(CODIGO) ", "CODIGO - ", "CODIGO ", "CODIGO:", etc.
                          const codigoPattern = new RegExp(`^\\s*\\(?${codigoEscaped}\\)?\\s*[:-]?\\s*`, 'i');
                          habilidadeTexto = habilidadeTexto.replace(codigoPattern, '').trim();
                        }
                        return (
                          <div className="mt-2">
                            <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                              {habilidadeTexto}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                {project.videoUrl && (
                  <button 
                    onClick={handleOpenInNewWindow}
                    className="flex-1 bg-primary px-4 py-3 rounded-[20px] text-white hover:bg-[#013668] transition-all flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir em Outra Janela</span>
                  </button>
                )}
                <button 
                  onClick={handleToggleFavorite}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[20px] transition-all font-semibold border-2 shadow-sm hover:shadow-md ${
                    isFavorite 
                      ? 'bg-destructive border-destructive text-white' 
                      : 'bg-white border-gray-300 hover:bg-red-50 hover:border-destructive text-destructive'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">Favoritar</span>
                  <span className="sm:hidden">Favoritos</span>
                </button>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-[20px] transition-all font-semibold shadow-sm ${
                    project.videoUrl
                      ? 'bg-white hover:bg-gray-50 border-gray-300 text-foreground hover:shadow-md'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!project.videoUrl}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border-2 border-gray-200 text-gray-400 rounded-[20px] transition-all font-semibold shadow-sm cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Orientações Metodológicas (PDF)</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Details */}
          <div className="flex flex-col space-y-6">
            <div className="bg-white border-2 border-gray-200 rounded-[20px] p-8 shadow-md space-y-6">
              {/* Description */}
              <div className="space-y-3">
                <h5 className="font-bold text-primary text-base">Sobre este ODA</h5>
                {project.description ? (
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {project.description}
                  </p>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-[20px] p-5 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">
                      Informações sobre este ODA em breve
                    </p>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Objectives */}
              <div className="space-y-3">
                <h6 className="font-bold text-secondary text-base">Objetivos de Aprendizagem</h6>
                {project.learningObjectives && project.learningObjectives.length > 0 ? (
                  <ul className="space-y-2.5">
                    {project.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5"></div>
                        <span className="text-muted-foreground text-sm leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-[20px] p-5 text-center">
                    <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">
                      Objetivos de aprendizagem serão adicionados em breve
                    </p>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Pedagogical Resources */}
              <div className="space-y-3">
                <h6 className="font-bold text-secondary text-base">Recursos Pedagógicos</h6>
                {project.pedagogicalResources && project.pedagogicalResources.length > 0 ? (
                  <ul className="space-y-2.5">
                    {project.pedagogicalResources.map((resource, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5"></div>
                        <span className="text-muted-foreground text-sm leading-relaxed">{resource}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-[20px] p-5 text-center">
                    <Book className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">
                      Recursos pedagógicos serão adicionados em breve
                    </p>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Technical Requirements */}
              <div className="space-y-3 p-5 bg-gray-50 rounded-[20px] border-2 border-gray-200">
                <h6 className="font-bold text-base">Requisitos Técnicos</h6>
                {(project.technicalRequirements || DEFAULT_TECHNICAL_REQUIREMENTS) ? (
                  <div className="space-y-2">
                    {(project.technicalRequirements || DEFAULT_TECHNICAL_REQUIREMENTS).split('\n').map((requirement, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground leading-relaxed">{requirement}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-[20px] p-5 text-center">
                    <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">
                      Requisitos técnicos serão especificados em breve
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Items Section */}
        {allProjects.length > 0 && onProjectClick && (
          <div className="mt-12">
            <div className="mb-6">
              <h4 className="text-foreground font-extrabold mb-1 text-lg">
                Você pode se interessar também por:
              </h4>
              <p className="text-muted-foreground text-sm">
                ODAs relacionados do mesmo ano escolar
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {allProjects
                .filter(p => p.id !== project.id && p.location === project.location)
                .slice(0, 5)
                .map((relatedProject) => (
                  <ProjectCard
                    key={relatedProject.id}
                    project={relatedProject}
                    onClick={() => onProjectClick(relatedProject)}
                    isFavorite={Array.isArray(favorites) && favorites.some(id => Number(id) === Number(relatedProject.id))}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}