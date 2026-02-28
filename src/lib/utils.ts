
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte links comuns para o formato de incorporação ou processamento seguro.
 * Lida com YouTube e players externos (HTTP/HTTPS).
 */
export function formatVideoUrl(url: string | undefined): string {
  if (!url) return "";
  
  const trimmedUrl = url.trim();

  // YouTube Normal: https://www.youtube.com/watch?v=ID
  // YouTube Short: https://youtu.be/ID
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmedUrl.match(youtubeRegex);
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
  }
  
  // Garantir que links HTTP sejam aceitos, embora alguns navegadores possam bloquear mixed content
  // se o site principal for HTTPS. Recomendamos sempre usar HTTPS se disponível.
  return trimmedUrl;
}
