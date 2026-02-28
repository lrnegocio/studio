
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte links comuns para o formato de incorporação ou processamento seguro.
 */
export function formatVideoUrl(url: string | undefined): string {
  if (!url) return "";
  
  const trimmedUrl = url.trim();

  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = trimmedUrl.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1`;
  }

  // Dailymotion
  const dailyRegex = /(?:dailymotion\.com(?:\/video|\/hub)|dai\.ly)\/([a-zA-Z0-9]+)/;
  const dailyMatch = trimmedUrl.match(dailyRegex);
  if (dailyMatch && dailyMatch[1]) {
    return `https://www.dailymotion.com/embed/video/${dailyMatch[1]}?autoplay=1`;
  }

  // VisionCine e similares (se já for um player embedado ou link direto)
  if (trimmedUrl.includes('visioncine.stream') || trimmedUrl.includes('playcnvs.stream')) {
    return trimmedUrl;
  }
  
  return trimmedUrl;
}

/**
 * Verifica se a URL provavelmente será bloqueada em um iframe por políticas de segurança restritas
 */
export function isPotentiallyBlocked(url: string | undefined): boolean {
  if (!url) return false;
  const blockedDomains = [
    'mercadolivre.com.br',
    'netflix.com',
    'primevideo.com',
    'disneyplus.com',
    'hbo.com',
    'globo.com'
  ];
  return blockedDomains.some(domain => url.toLowerCase().includes(domain));
}
