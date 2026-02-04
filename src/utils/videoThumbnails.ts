/**
 * Utilitários para obter thumbnails de vídeos
 */

/**
 * Verifica se a URL é a thumbnail padrão do Vimeo (capa listrada que queremos evitar)
 * @param url - URL da imagem (ex: https://i.vimeocdn.com/video/123_640.jpg)
 */
export function isVimeoDefaultThumbnail(url: string | undefined): boolean {
  return !!url && /i\.vimeocdn\.com\/video\//i.test(url);
}

/**
 * Parâmetros para deixar o embed do Vimeo mais limpo (sem título, byline, retrato, badge, logo).
 * Reduz botões de engajamento e sensação de "redirecionar ao Vimeo".
 */
const VIMEO_CLEAN_PARAMS = [
  'title=0',
  'byline=0',
  'portrait=0',
  'badge=0',
  'vimeo_logo=0',
  'dnt=1', // Do Not Track - reduz analytics no player
].join('&');

/**
 * Monta a URL do embed do Vimeo com player limpo (sem favorito, byline, logo etc.) e opção de autoplay.
 * @param videoUrl - URL do vídeo (ex: https://player.vimeo.com/video/123?h=xxx)
 * @param options - { autoplay: true } para iniciar ao abrir
 */
export function getVimeoEmbedUrl(videoUrl: string, options?: { autoplay?: boolean }): string {
  if (!videoUrl) return videoUrl;
  const sep = videoUrl.includes('?') ? '&' : '?';
  const extra = options?.autoplay ? '&autoplay=1' : '';
  return `${videoUrl}${sep}${VIMEO_CLEAN_PARAMS}${extra}`;
}

/** @deprecated Use getVimeoEmbedUrl(url, { autoplay: true }) */
export function getVimeoUrlWithAutoplay(videoUrl: string): string {
  return getVimeoEmbedUrl(videoUrl, { autoplay: true });
}

/**
 * Extrai o ID do vídeo do Vimeo a partir da URL
 * @param url - URL do Vimeo (ex: https://player.vimeo.com/video/780826423?h=6c0fc1f)
 * @returns ID do vídeo ou null
 */
export function extractVimeoVideoId(url: string): string | null {
  if (!url) return null;
  
  // Padrões de URL do Vimeo
  const patterns = [
    /vimeo\.com\/video\/(\d+)/i,
    /vimeo\.com\/(\d+)/i,
    /player\.vimeo\.com\/video\/(\d+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Normaliza URL do Vimeo para oEmbed
 * @param url - URL do vídeo do Vimeo
 * @returns URL normalizada ou null
 */
function normalizeVimeoUrl(url: string): string | null {
  if (!url) return null;
  
  const vimeoId = extractVimeoVideoId(url);
  if (vimeoId) {
    return `https://vimeo.com/${vimeoId}`;
  }
  
  return null;
}

// Cache de IDs de vídeos em que o oEmbed retornou 404 (vídeo privado/inexistente).
// Evita chamadas repetidas e reduz erros no console.
const oEmbed404Cache = new Set<string>();

/**
 * Obtém thumbnail do Vimeo usando oEmbed API (método recomendado)
 * Vídeos privados ou sem oEmbed retornam 404; nesses casos usamos o cache para não repetir a requisição.
 * @param videoUrl - URL do vídeo do Vimeo
 * @returns URL da thumbnail ou null
 */
async function getVimeoThumbnailFromOEmbed(videoUrl: string): Promise<string | null> {
  const vimeoId = extractVimeoVideoId(videoUrl);
  if (!vimeoId) return null;

  if (oEmbed404Cache.has(vimeoId)) {
    return null;
  }

  try {
    const normalizedUrl = normalizeVimeoUrl(videoUrl);
    if (!normalizedUrl) return null;
    
    const oEmbedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(normalizedUrl)}`;
    const response = await fetch(oEmbedUrl);
    
    if (response.status === 404) {
      oEmbed404Cache.add(vimeoId);
      return null;
    }
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.thumbnail_url || data.thumbnail_url_with_play_button || null;
  } catch {
    return null;
  }
}

/**
 * Tenta obter thumbnail de um momento específico do vídeo usando Vimeo API
 * Nota: A API pública do Vimeo não permite especificar tempo exato, mas o oEmbed
 * geralmente retorna uma thumbnail dos primeiros segundos
 * @param videoUrl - URL do vídeo do Vimeo
 * @param timeInSeconds - Tempo em segundos (não suportado diretamente pela API pública)
 * @returns URL da thumbnail ou null
 */
async function getVimeoThumbnailAtTime(videoUrl: string, timeInSeconds: number = 6): Promise<string | null> {
  // A API pública do Vimeo não permite especificar tempo exato para thumbnails
  // Mas podemos usar o oEmbed que geralmente retorna thumbnail do início
  // Para uma solução mais precisa, seria necessário usar a API autenticada do Vimeo
  // ou um serviço de terceiros como Cloudinary/ImageKit
  
  // Por enquanto, usamos o oEmbed que retorna thumbnail do início
  return await getVimeoThumbnailFromOEmbed(videoUrl);
}

/**
 * Gera URL da thumbnail do Vimeo usando método direto (fallback)
 * @param videoId - ID do vídeo do Vimeo
 * @param size - Tamanho da thumbnail (640, 1280, etc.)
 * @returns URL da thumbnail
 */
export function getVimeoThumbnail(videoId: string, size: number = 640): string {
  // Tenta diferentes tamanhos de thumbnail
  return `https://i.vimeocdn.com/video/${videoId}_${size}.jpg`;
}

/**
 * Obtém a URL da thumbnail do vídeo (Vimeo ou fallback)
 * Versão síncrona que usa método direto (mais rápido, mas pode não funcionar para todos)
 * @param videoUrl - URL do vídeo
 * @param fallbackImage - URL da imagem de fallback
 * @returns URL da thumbnail ou fallback
 */
export function getVideoThumbnail(videoUrl: string | undefined, fallbackImage?: string): string {
  if (!videoUrl) {
    return fallbackImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
  }
  
  const vimeoId = extractVimeoVideoId(videoUrl);
  if (vimeoId) {
    // Tenta diferentes tamanhos de thumbnail do Vimeo
    // O Vimeo geralmente tem thumbnails em 640x360, 1280x720, etc.
    return getVimeoThumbnail(vimeoId, 1280);
  }
  
  // Se não for Vimeo, retornar fallback
  return fallbackImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
}

/**
 * Obtém thumbnail do vídeo de forma assíncrona usando oEmbed (mais confiável)
 * Tenta obter thumbnail dos primeiros 6 segundos do vídeo
 * @param videoUrl - URL do vídeo
 * @param fallbackImage - URL da imagem de fallback
 * @param timeInSeconds - Tempo em segundos para capturar thumbnail (padrão: 6 segundos)
 * @returns Promise com URL da thumbnail
 */
export async function getVideoThumbnailAsync(videoUrl: string | undefined, fallbackImage?: string, timeInSeconds: number = 6): Promise<string> {
  if (!videoUrl) {
    return fallbackImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
  }
  
  // Tenta obter thumbnail dos primeiros segundos via oEmbed (mais confiável)
  // O oEmbed do Vimeo geralmente retorna thumbnail do início do vídeo
  const oEmbedThumbnail = await getVimeoThumbnailAtTime(videoUrl, timeInSeconds);
  if (oEmbedThumbnail) {
    return oEmbedThumbnail;
  }
  
  // Fallback para método direto
  const vimeoId = extractVimeoVideoId(videoUrl);
  if (vimeoId) {
    return getVimeoThumbnail(vimeoId, 1280);
  }
  
  // Se não for Vimeo, retornar fallback
  return fallbackImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
}

