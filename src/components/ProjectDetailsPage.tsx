import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Clock, Share2, Check, ExternalLink, Eye, Sparkles, Play, Book, FileText, ArrowLeft, Heart, Link as LinkIcon, QrCode } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { getCurriculumColor, getMarcaColor } from '../utils/odaColors';
import { odaService } from '../services/odaService';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  tag: string;
  tags?: string[];
  location: string;
  image: string;
  videoUrl?: string;
  bnccCode?: string;
  bnccDescription?: string;
  category?: string;
  duration?: string;
  volume?: string;
  livro?: string;
  pagina?: string;
  marca?: string;
  contentType?: string;
  samr?: string;
  tipoObjeto?: string;
  views?: number;
  description?: string;
  lastUpdate?: string;
}

interface ProjectDetailsPageProps {
  project: Project;
  onBack: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (projectId: string) => void;
}

export function ProjectDetailsPage({ project, onBack, isFavorite = false, onToggleFavorite }: ProjectDetailsPageProps) {
  const { user } = useAuth();
  const [isShared, setIsShared] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [views, setViews] = useState(project.views || 0);
  const hasIncrementedRef = useRef(false); // Ref para garantir que só execute uma vez por montagem

  // Gerar ou obter sessionId do localStorage
  const getOrCreateSessionId = (): string => {
    let sessionId = localStorage.getItem('acervo_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('acervo_session_id', sessionId);
    }
    return sessionId;
  };

  // Incrementar visualizações quando o componente for montado (apenas uma vez por dia)
  useEffect(() => {
    // Se já tentou incrementar nesta montagem, não fazer nada
    if (hasIncrementedRef.current) {
      console.log(`[Views] 🔒 Já tentou incrementar nesta montagem, bloqueando nova tentativa.`);
      return;
    }

    const viewKey = `acervo_viewed_${project.id}`;
    const today = new Date().toDateString();
    let isMounted = true; // Flag para evitar execuções após desmontagem
    
    // Verificar se já visualizou hoje ANTES de fazer qualquer coisa
    const checkIfAlreadyViewed = (): boolean => {
      try {
        const hasViewed = localStorage.getItem(viewKey);
        if (!hasViewed) {
          console.log(`[Views] Primeira visualização do ODA "${project.title}" hoje.`);
          return false; // Não visualizou ainda
        }
        
        const viewData = JSON.parse(hasViewed);
        // Comparar datas de forma mais robusta
        const viewedDate = viewData.date;
        
        if (viewedDate === today) {
          console.log(`[Views] ⚠️ ODA "${project.title}" já foi visualizado hoje (${today}), NÃO incrementando.`);
          console.log(`[Views] Dados do localStorage:`, viewData);
          // Marcar como já processado para evitar novas tentativas
          hasIncrementedRef.current = true;
          return true; // Já visualizou hoje - BLOQUEAR incremento
        }
        
        // Se a data é diferente, limpar e permitir nova visualização
        console.log(`[Views] Data antiga (${viewedDate}) diferente de hoje (${today}), limpando e permitindo nova visualização.`);
        localStorage.removeItem(viewKey);
        return false;
      } catch (error) {
        console.error('[Views] Erro ao verificar localStorage:', error);
        // Se houver erro, limpar e permitir nova tentativa
        localStorage.removeItem(viewKey);
        return false;
      }
    };

    // Se já visualizou hoje, SAIR IMEDIATAMENTE sem fazer nada
    if (checkIfAlreadyViewed()) {
      console.log(`[Views] 🛑 SAINDO do useEffect - já visualizado hoje, nenhuma chamada será feita.`);
      return; // Sair do useEffect completamente - NÃO EXECUTA incrementView
    }

    // Marcar como processado ANTES de fazer qualquer coisa
    hasIncrementedRef.current = true;

    // Se chegou aqui, pode incrementar (não visualizou hoje ainda)
    const incrementView = async () => {
      if (!isMounted) {
        console.log(`[Views] Componente desmontado, cancelando incremento.`);
        return;
      }
      
      try {
        console.log(`[Views] 🚀 Iniciando incremento para ODA "${project.title}" (ID: ${project.id})...`);
        
        // Marcar como visualizado ANTES de fazer a chamada (otimista)
        const viewData = {
          date: today,
          timestamp: Date.now(),
          odaId: project.id,
          odaTitle: project.title
        };
        
        localStorage.setItem(viewKey, JSON.stringify(viewData));
        console.log(`[Views] ✅ Marcado no localStorage:`, viewData);
        
        // Enviar sessionId se não houver userId (usuário não autenticado)
        const sessionId = user ? undefined : getOrCreateSessionId();
        await odaService.incrementView(project.id, sessionId);
        
        if (!isMounted) return; // Verificar novamente após async
        
        // Atualizar o contador local após incrementar
        setViews((prev) => prev + 1);
        
        console.log(`[Views] ✅✅ Visualização incrementada com sucesso no banco para ODA "${project.title}"`);
      } catch (error) {
        console.error('[Views] ❌ Erro ao incrementar visualizações:', error);
        // Se houver erro, remover do localStorage para tentar novamente depois
        localStorage.removeItem(viewKey);
        // Resetar o ref para permitir nova tentativa
        hasIncrementedRef.current = false;
        console.log(`[Views] Limpado localStorage e resetado ref devido ao erro, permitindo nova tentativa.`);
      }
    };

    // Executar imediatamente
    incrementView();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [project.id, project.title]);

  // Resetar o ref quando o projeto mudar (navegação para outro ODA)
  useEffect(() => {
    hasIncrementedRef.current = false;
  }, [project.id]);

  // Generate mock data for the ODA details
  const odaDetails = {
    description: project.description || "Este objeto digital de aprendizagem foi desenvolvido para trabalhar de forma lúdica e interativa com os estudantes dos anos iniciais, promovendo o desenvolvimento de competências essenciais alinhadas à BNCC.",
    lastUpdate: project.lastUpdate ? new Date(project.lastUpdate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : "15 de Outubro, 2024",
    views: views,
    learningObjectives: [
      "Desenvolver habilidades de leitura e interpretação",
      "Estimular o pensamento crítico e a criatividade",
      "Promover a autonomia e o protagonismo dos estudantes",
      "Facilitar a construção do conhecimento de forma colaborativa"
    ],
    pedagogicalResources: [
      "Guia do professor com orientações didáticas",
      "Atividades complementares para impressão",
      "Sugestões de avaliação formativa",
      "Materiais de apoio em diferentes formatos"
    ],
    technicalRequirements: [
      "Navegador web atualizado (Chrome, Firefox, Safari)",
      "Conexão com internet (mínimo 2 Mbps)",
      "Dispositivos compatíveis: computador, tablet ou smartphone",
      "Não requer instalação de software adicional"
    ]
  };

  // Related projects will be loaded from backend in the integrated version
  // For now, using empty array - will be populated by parent component
  const relatedProjects: Project[] = [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Confira este ODA: ${project.title}`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const handleShowQRCode = () => {
    // In a real app, you would generate a QR code here
    alert('QR Code seria gerado aqui com o link do ODA');
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(project.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="bg-primary sticky top-0 z-50 shadow-2xl">
        <div className="px-4 sm:px-6 lg:px-10 py-6">
          <div className="max-w-[1800px] mx-auto">
            <button
              onClick={onBack}
              className="flex items-center gap-3 text-white hover:bg-white/20 backdrop-blur-sm px-5 py-3 rounded-full transition-all duration-300 border-2 border-white/40 hover:border-white/60 shadow-lg hover:shadow-xl font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao Acervo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-10 py-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN - Video and Primary Info */}
            <div className="flex flex-col space-y-6">
              {/* Video Preview Section */}
              <div className="w-full">
                <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl">
                  {!showVideo ? (
                    <>
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      {project.contentType === 'Audiovisual' && project.videoUrl && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <button
                            onClick={() => setShowVideo(true)}
                            className="w-24 h-24 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl group"
                          >
                            <Play className="w-12 h-12 text-primary ml-1 group-hover:text-secondary transition-colors" fill="currentColor" />
                          </button>
                        </div>
                      )}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-3">
                          {project.volume && (
                            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl">
                              <span className="text-sm font-bold text-foreground">{project.volume}</span>
                            </div>
                          )}
                          {project.category && (
                            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl">
                              <span className="text-sm font-bold text-primary">{project.category}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    project.videoUrl && (
                      <iframe
                        src={project.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )
                  )}
                </div>
              </div>

              {/* Card with Info */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl space-y-6">
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.map((tag, index) => (
                      <div
                        key={index}
                        className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold border-2 shadow-md ${
                          index === 0 ? getCurriculumColor(tag) : 
                          index === 1 ? 'bg-secondary/10 text-secondary border-secondary/20' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {tag}
                      </div>
                    ))
                  ) : (
                    <div className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold border-2 shadow-md ${getCurriculumColor(project.tag)}`}>
                      {project.tag}
                    </div>
                  )}
                  {project.marca && (
                    <div className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold border-2 shadow-md ${getMarcaColor(project.marca)}`}>
                      {project.marca}
                    </div>
                  )}
                </div>
                
                <h1 className="text-2xl text-primary font-extrabold">
                  {project.title}
                </h1>

                {/* Info Row - Year, Duration, Book, Page */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-full border-2 border-gray-200 shadow-md">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="font-bold">{project.location}</span>
                  </div>
                  {project.duration && (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-full border-2 border-gray-200 shadow-md">
                      <Clock className="w-5 h-5 text-secondary" />
                      <span className="font-bold">{project.duration}</span>
                    </div>
                  )}
                  {project.livro && (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-100 border-2 border-blue-300 rounded-full shadow-md">
                      <Book className="w-5 h-5 text-blue-700" />
                      <span className="font-bold text-blue-900">{project.livro}</span>
                    </div>
                  )}
                  {project.pagina && (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-purple-100 border-2 border-purple-300 rounded-full shadow-md">
                      <FileText className="w-5 h-5 text-purple-700" />
                      <span className="font-bold text-purple-900">Págs {project.pagina}</span>
                    </div>
                  )}
                </div>

                {/* SAMR Badge */}
                {project.samr && (
                  <div className="bg-amber-100 border-2 border-amber-300 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-start gap-4">
                      <Sparkles className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-bold text-amber-900 mb-2">
                          Escala SAMR: {project.samr}
                        </p>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          Este ODA está classificado no nível "{project.samr}" da escala SAMR, indicando o grau de integração tecnológica na experiência de aprendizagem.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* BNCC Code */}
                {project.bnccCode && (
                  <div className="bg-gray-100 border-2 border-gray-200 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-start gap-4">
                      <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-bold text-primary mb-2">
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

                {/* Stats Row - Only Views and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-5 bg-gray-100 rounded-2xl border-2 border-gray-200 shadow-md">
                    <Eye className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="font-bold text-foreground text-lg">{odaDetails.views}</p>
                    <p className="text-xs font-bold text-muted-foreground">Visualizações</p>
                  </div>
                  
                  <div className="text-center p-5 bg-gray-100 rounded-2xl border-2 border-gray-200 shadow-md">
                    <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="font-bold text-foreground text-lg">Ativo</p>
                    <p className="text-xs font-bold text-muted-foreground">Status</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 bg-primary px-6 py-4 rounded-full text-white hover:bg-primary/90 hover:shadow-2xl transition-all flex items-center justify-center gap-3 font-bold">
                    <ExternalLink className="w-5 h-5" />
                    <span>Abrir em Outra Janela</span>
                  </button>
                  <button 
                    onClick={handleToggleFavorite}
                    className={`p-4 rounded-full transition-all hover:shadow-lg font-bold border-2 hover:scale-110 ${
                      isFavorite 
                        ? 'bg-destructive border-destructive shadow-destructive/30' 
                        : 'bg-white border-gray-200 hover:bg-red-50 hover:border-destructive'
                    }`}
                  >
                    <Heart className={`w-6 h-6 transition-all ${isFavorite ? 'text-white fill-white' : 'text-destructive'}`} />
                  </button>
                </div>

                {/* Share Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 rounded-full transition-all font-bold text-foreground"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                  </button>
                  <button
                    onClick={handleShowQRCode}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 rounded-full transition-all font-bold"
                  >
                    <QrCode className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-200 rounded-full transition-all font-bold text-orange-800"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Details */}
            <div className="flex flex-col space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl space-y-6">
                {/* Description */}
                <div className="space-y-3">
                  <h5 className="font-bold text-primary">Sobre este ODA</h5>
                  <p className="text-muted-foreground leading-relaxed">
                    {odaDetails.description}
                  </p>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Objectives */}
                <div className="space-y-4">
                  <h6 className="font-bold text-secondary">Objetivos de Aprendizagem</h6>
                  <ul className="space-y-3">
                    {odaDetails.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0 mt-2"></div>
                        <span className="text-muted-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Pedagogical Resources */}
                <div className="space-y-4">
                  <h6 className="font-bold text-secondary">Recursos Pedagógicos</h6>
                  <ul className="space-y-3">
                    {odaDetails.pedagogicalResources.map((resource, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0 mt-2"></div>
                        <span className="text-muted-foreground">{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Technical Requirements */}
                <div className="space-y-4 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                  <h6 className="font-bold">Requisitos Técnicos</h6>
                  <ul className="space-y-3">
                    {odaDetails.technicalRequirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground pt-3 border-t border-gray-200">
                    Última atualização: {odaDetails.lastUpdate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Items Section */}
          <div className="mt-16">
            <div className="mb-6">
              <h4 className="text-foreground font-bold mb-1">
                Você pode se interessar também por:
              </h4>
              <p className="text-muted-foreground text-sm">
                Itens relacionados do mesmo nível escolar
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProjects.map((relatedProject) => (
                <ProjectCard
                  // @ts-expect-error - key is a special React prop, not part of ProjectCardProps
                  key={relatedProject.id}
                  project={relatedProject}
                  onClick={() => {}}
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}