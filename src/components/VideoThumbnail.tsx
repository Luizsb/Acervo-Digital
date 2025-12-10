import React, { useState, useEffect } from 'react';
import { getVideoThumbnail, getVideoThumbnailAsync, extractVimeoVideoId } from '../utils/videoThumbnails';

interface VideoThumbnailProps {
  videoUrl?: string;
  fallbackImage?: string;
  alt?: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Componente que carrega thumbnail de vídeo com fallback inteligente
 * Tenta primeiro o método direto (rápido), depois oEmbed se necessário
 */
export function VideoThumbnail({ 
  videoUrl, 
  fallbackImage, 
  alt = 'Video thumbnail',
  className = '',
  onError
}: VideoThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setThumbnailUrl(fallbackImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080');
      setIsLoading(false);
      return;
    }

    // Primeiro, tenta método direto (rápido)
    const directThumbnail = getVideoThumbnail(videoUrl, fallbackImage);
    setThumbnailUrl(directThumbnail);
    setIsLoading(false);

    // Se for Vimeo, tenta buscar via oEmbed em background para melhor qualidade
    // Usa os primeiros 6 segundos do vídeo para a thumbnail
    const vimeoId = extractVimeoVideoId(videoUrl);
    if (vimeoId) {
      getVideoThumbnailAsync(videoUrl, fallbackImage, 6)
        .then((betterThumbnail) => {
          if (betterThumbnail && betterThumbnail !== directThumbnail) {
            setThumbnailUrl(betterThumbnail);
          }
        })
        .catch(() => {
          // Se oEmbed falhar, mantém o método direto
        });
    }
  }, [videoUrl, fallbackImage]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    
    // Tenta diferentes tamanhos de thumbnail do Vimeo
    const vimeoId = extractVimeoVideoId(videoUrl || '');
    if (vimeoId) {
      const sizes = [640, 960, 1280, 1920];
      const currentSize = parseInt(thumbnailUrl.match(/_(\d+)\.jpg/)?.[1] || '1280');
      const nextSizeIndex = sizes.indexOf(currentSize) + 1;
      
      if (nextSizeIndex < sizes.length) {
        const nextSize = sizes[nextSizeIndex];
        const newUrl = `https://i.vimeocdn.com/video/${vimeoId}_${nextSize}.jpg`;
        setThumbnailUrl(newUrl);
        setHasError(false);
        return;
      }
    }
    
    // Se todas as tentativas falharem, usa fallback
    const defaultImage = fallbackImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
    if (thumbnailUrl !== defaultImage) {
      setThumbnailUrl(defaultImage);
      setHasError(false);
    }
    
    // Chama callback de erro se fornecido
    if (onError) {
      onError(e);
    }
  };

  if (!thumbnailUrl) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`} />
    );
  }

  return (
    <img
      src={thumbnailUrl}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}

